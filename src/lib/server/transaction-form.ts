import { fail } from "@sveltejs/kit";
import { z } from "zod";
import { getCore } from "#lib/server/index.ts";

/** Reference data the transaction wizard needs, shared by create and edit. */
export async function loadWizardData() {
  const core = getCore();
  const [accounts, categories, recent, settings, tags] = await Promise.all([
    core.accounts.listWithBalances(),
    core.categories.list(),
    core.transactions.list({ limit: 50 }),
    core.settings.get(),
    core.tags.list(),
  ]);
  const suggestions = [
    ...new Set(
      recent.items.map((t) => t.description).filter((d) => d !== "N/A"),
    ),
  ].slice(0, 10);
  return {
    accounts: accounts.map(({ id, name, isOut, balance }) => ({
      id,
      name,
      isOut,
      balance,
    })),
    categories: categories.map(({ id, name, color, icon }) => ({
      id,
      name,
      color,
      icon,
    })),
    suggestions,
    /** The existing tags. */
    tags: tags.map(({ name, color }) => ({ name, color })),
    /** Where expenses are paid to unless the user picks another account. */
    defaultOutAccountId: settings.defaultOutAccountId,
  };
}

const flag = z.preprocess((v) => v === "on", z.boolean());
const optionalId = z.preprocess(
  (v) => (v === "" || v === null ? undefined : v),
  z.coerce.number().int().optional(),
);

const Form = z.object({
  type: z.enum(["EXPENSE", "INCOME", "TRANSFER", "HIDDEN"]),
  amount: z.coerce.number().positive("Amount must be greater than zero"),
  currency: z.enum(["CZK", "EUR", "USD"]),
  categoryId: z.coerce.number().int("Pick a category"),
  accountId: z.coerce.number().int("Pick an account"),
  targetId: optionalId,
  description: z.string().trim().optional(),
  transactedAt: z.coerce.date("Pick a valid date and time"),
  recurring: flag,
  recurringMonths: z.preprocess(
    (v) => (v === "" || v === undefined ? 1 : v),
    z.coerce
      .number("Repeat period must be a number")
      .int("Repeat period must be a whole number of months")
      .min(1, "Repeat period must be at least 1 month"),
  ),
  isHidden: flag,
  isImportant: flag,
});

const failure = (values: Record<string, string>, errors: string[]) =>
  fail(400, { values, errors });

/**
 * Validate the wizard's form post and translate it into the fields shared by
 * transaction creation and updates. Returns a `fail()` result on bad input.
 */
export async function parseTransactionForm(request: Request) {
  const formData = await request.formData();
  const values = Object.fromEntries(
    [...formData].filter(([, v]) => typeof v === "string"),
  ) as Record<string, string>;
  // The one field that repeats: a transaction has any number of tags.
  const tags = [
    ...new Set(
      formData
        .getAll("tags")
        .filter((v): v is string => typeof v === "string")
        .map((v) => v.trim())
        .filter(Boolean),
    ),
  ];
  const parsed = Form.safeParse(values);
  if (!parsed.success) {
    return failure(
      values,
      Object.values(z.flattenError(parsed.error).fieldErrors).flat(),
    );
  }
  const {
    type,
    accountId,
    targetId,
    description,
    recurring,
    recurringMonths,
    ...rest
  } = parsed.data;

  const core = getCore();
  const accounts = await core.accounts.list();
  const { defaultOutAccountId } = await core.settings.get();
  // The external counterpart: the configured default, else any external account.
  const outside =
    accounts.find((a) => a.id === defaultOutAccountId && a.isOut) ??
    accounts.find((a) => a.isOut);
  let sourceId = accountId;
  let target = outside?.id;
  if (type === "INCOME") [sourceId, target] = [outside?.id ?? NaN, accountId];
  if (type === "TRANSFER") {
    if (targetId === undefined || targetId === accountId) {
      return failure(values, ["Choose two different accounts"]);
    }
    target = targetId;
  }
  if ((type === "EXPENSE" || type === "HIDDEN") && targetId !== undefined) {
    // The user may pay to another external account than the default.
    if (!accounts.some((a) => a.id === targetId && a.isOut)) {
      return failure(values, ["Choose an external account to pay to"]);
    }
    target = targetId;
  }
  if (target === undefined || Number.isNaN(sourceId)) {
    return failure(values, [
      'No external account to pair with — create one marked "out" first',
    ]);
  }

  const category = (await core.categories.list()).find(
    (c) => c.id === rest.categoryId,
  );
  return {
    amount: rest.amount,
    currency: rest.currency,
    categoryId: rest.categoryId,
    transactedAt: rest.transactedAt,
    description: description || category?.name,
    sourceId,
    targetId: target,
    recurring: recurring ? recurringMonths : 0,
    isHidden: rest.isHidden || type === "HIDDEN",
    isImportant: rest.isImportant,
    tags,
  };
}
