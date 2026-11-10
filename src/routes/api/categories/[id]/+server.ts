import { error, json } from "@sveltejs/kit";
import { z } from "zod";
import { m } from "#paraglide/messages.js";
import { hq } from "#lib/server/index.ts";
import { CategoryPatch, NotFoundError } from "#lib/server/core/index.ts";
import type { RequestHandler } from "./$types";

/** Partial update of a single category (used for in-place editing). */
export const PATCH: RequestHandler = async ({ params, request, locals }) => {
  if (!locals.user) error(401, m.categories_not_signed_in());
  const id = Number(params.id);
  if (!Number.isInteger(id)) error(404, m.categories_not_found());

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    error(400, m.categories_invalid_json());
  }
  const parsed = CategoryPatch.safeParse(body);
  if (!parsed.success) {
    error(400, z.prettifyError(parsed.error));
  }
  if (Object.keys(parsed.data).length === 0)
    error(400, m.categories_nothing_to_update());

  try {
    return json(await hq(locals).categories.update(id, parsed.data));
  } catch (e) {
    if (e instanceof NotFoundError) error(404, e.message);
    throw e;
  }
};
