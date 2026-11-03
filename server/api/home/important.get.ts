import { home } from "~/server/controllers";

/** Important transactions waiting for a confirmation, whatever their date. */
export default defineEventHandler(() => home.getImportant());
