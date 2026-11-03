import { home } from "~/server/controllers";

/** Portfolio accounts with their current balances, grouped by account type. */
export default defineEventHandler(() => home.getPortfolio());
