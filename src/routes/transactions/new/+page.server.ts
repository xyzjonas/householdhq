import { fail, redirect } from "@sveltejs/kit";
import { z } from "zod";
import { getCore } from "#lib/server/index.ts";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
  const core = getCore();
  const [accounts, categories] = await Promise.all([
    core.accounts.list(),
    core.categories.list(),
  ]);
  return { accounts, categories };
};

const Form = z.object({
  description: z.string().trim().min(1, "Description is required"),
  amount: z.coerce.number().positive("Amount must be positive"),
  sourceId: z.coerce.number().int(),
  targetId: z.coerce.number().int(),
  categoryId: z.preprocess(
    (v) => (v === "" ? undefined : v),
    z.coerce.number().int().optional(),
  ),
  transactedAt: z.preprocess(
    (v) => (v === "" ? undefined : v),
    z.coerce.date().optional(),
  ),
});

export const actions: Actions = {
  default: async ({ request }) => {
    const values = Object.fromEntries(await request.formData());
    const parsed = Form.safeParse(values);
    if (!parsed.success) {
      return fail(400, {
        values: values as Record<string, string>,
        errors: z.flattenError(parsed.error).fieldErrors,
      });
    }
    if (parsed.data.sourceId === parsed.data.targetId) {
      return fail(400, {
        values: values as Record<string, string>,
        errors: { targetId: ["From and to must differ"] },
      });
    }
    await getCore().transactions.create(parsed.data);
    redirect(303, "/");
  },
};
