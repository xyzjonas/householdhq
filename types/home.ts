import z from "zod";
import type { Category, SourceType, Transaction } from "~/types";
import { FiscalPeriodEndDaySchema } from "./appSettings";

/**
 * Query / response contracts of the `/api/home/*` endpoints which feed the
 * home page widgets. Dates travel as ISO strings (instants) or `YYYY-MM-DD`
 * strings (calendar days).
 */

export const HomePeriodQuerySchema = z.object({
  /** period identified by the month it ends in (`YYYY-MM`), current if omitted */
  period: z
    .string()
    .regex(/^\d{4}-(0[1-9]|1[0-2])$/)
    .optional(),
});

export const HomeTransactionsQuerySchema = HomePeriodQuerySchema.extend({
  categoryId: z.coerce.number().int().optional(),
  kind: z.enum(["income", "expense"]).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(30),
  offset: z.coerce.number().int().min(0).default(0),
});

export type HomeTransactionsQuery = z.infer<typeof HomeTransactionsQuerySchema>;

export interface HomePeriod {
  key: string;
  startDay: string;
  endDay: string;
  prevKey: string;
  nextKey: string;
  isCurrent: boolean;
  fiscalPeriodEndDay: number;
}

export { FiscalPeriodEndDaySchema };

export interface HomeProjection {
  /** last day the projection accounts for (`YYYY-MM-DD`) */
  date: string;
  /** balance expected at the end of that day */
  projected: number;
  /** net effect of the pending transactions on the balance */
  pendingTotal: number;
  pendingCount: number;
}

export interface HomeBalance {
  /** money available to spend right now */
  balance: number;
  calendarMonthEnd: HomeProjection;
  fiscalPeriodEnd: HomeProjection;
}

export interface HomeCategorySum extends Pick<
  Category,
  "id" | "name" | "color" | "description"
> {
  sum: number;
  count: number;
}

export interface HomeSummary {
  period: HomePeriod;
  income: number;
  expense: number;
  net: number;
  incomeCategories: HomeCategorySum[];
  expenseCategories: HomeCategorySum[];
}

export interface HomeTransactionList {
  total: number;
  limit: number;
  offset: number;
  items: Transaction[];
}

export interface HomeUpcoming {
  /** last day covered by the list (`YYYY-MM-DD`) */
  until: string;
  count: number;
  /** sum of the upcoming expenses */
  expenseTotal: number;
  items: Transaction[];
}

export interface HomeImportant {
  items: Transaction[];
}

export interface HomePortfolioSource {
  id: number;
  name: string;
  color: string | null;
  type: SourceType;
  balance: number;
  /** no balance snapshot was recorded in the current calendar month yet */
  stale: boolean;
}

export interface HomePortfolioGroup {
  type: SourceType;
  total: number;
  sources: HomePortfolioSource[];
}

export interface HomePortfolio {
  groups: HomePortfolioGroup[];
}

export interface HomeProject {
  id: number;
  name: string;
  color: string | null;
  transactionCount: number;
  total: number;
}

export interface HomeProjects {
  items: HomeProject[];
}
