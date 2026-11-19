import { fail } from "@sveltejs/kit";
import { m } from "#paraglide/messages.js";
import { parseBudget } from "#lib/categories-view.ts";

/**
 * Reads the budget dialog's form: the new monthly budget, `null` to remove it,
 * or a failed action when the amount is not a positive number.
 */
export function readBudgetForm(
  formData: FormData,
): { budget: number | null } | { failure: ReturnType<typeof fail> } {
  if (formData.has("clear")) return { budget: null };
  const budget = parseBudget(formData.get("monthlyBudget"));
  if (budget === undefined)
    return { failure: fail(400, { budgetMessage: m.budget_invalid_amount() }) };
  return { budget };
}
