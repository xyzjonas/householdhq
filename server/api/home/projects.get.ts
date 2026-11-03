import { home } from "~/server/controllers";

/** Projects that are still in progress. */
export default defineEventHandler(() => home.getProjects());
