import { fail, redirect } from "@sveltejs/kit";
import { z } from "zod";
import { getCore } from "#lib/server/index.ts";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
  const core = getCore();
  const [accounts, categories, recent] = await Promise.all([
    core.accounts.listWithBalances(),
    core.categories.list(),
    core.transactions.list({ limit: 50 }),
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
  };
};

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
  isHidden: flag,
  isImportant: flag,
});

const failure = (values: Record<string, string>, errors: string[]) =>
  fail(400, { values, errors });

export const actions: Actions = {
  default: async ({ request }) => {
    const values = Object.fromEntries(
      [...(await request.formData())].filter(([, v]) => typeof v === "string"),
    ) as Record<string, string>;
    const parsed = Form.safeParse(values);
    if (!parsed.success) {
      return failure(
        values,
        Object.values(z.flattenError(parsed.error).fieldErrors).flat(),
      );
    }
    const { type, accountId, targetId, description, recurring, ...rest } =
      parsed.data;

    const core = getCore();
    const outside = (await core.accounts.list()).find((a) => a.isOut);
    let sourceId = accountId;
    let target = outside?.id;
    if (type === "INCOME") [sourceId, target] = [outside?.id ?? NaN, accountId];
    if (type === "TRANSFER") {
      if (targetId === undefined || targetId === accountId) {
        return failure(values, ["Choose two different accounts"]);
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
    await core.transactions.create({
      amount: rest.amount,
      currency: rest.currency,
      categoryId: rest.categoryId,
      transactedAt: rest.transactedAt,
      description: description || category?.name,
      sourceId,
      targetId: target,
      recurring: recurring ? 1 : 0,
      isHidden: rest.isHidden || type === "HIDDEN",
      isImportant: rest.isImportant,
    });
    redirect(303, "/");
  },
};
