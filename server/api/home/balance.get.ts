import { home } from "~/server/controllers";

/**
 * Balance available to spend right now and its projection to the end of the
 * calendar month and of the fiscal period.
 */
export default defineEventHandler(() => home.getBalance());
