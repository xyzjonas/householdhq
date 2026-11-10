import { m } from "#paraglide/messages.js";
import { error, json } from "@sveltejs/kit";
import { z } from "zod";
import { hq } from "#lib/server/index.ts";
import {
  ConflictError,
  VehicleComponentInput,
} from "#lib/server/core/index.ts";
import type { RequestHandler } from "./$types";

/** Creates a service component (used on the fly while recording a service). */
export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) error(401, m.vehicles_error_not_signed_in());

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    error(400, m.vehicles_error_invalid_json());
  }
  const parsed = VehicleComponentInput.safeParse(body);
  if (!parsed.success) error(400, z.prettifyError(parsed.error));

  try {
    return json(await hq(locals).vehicles.components.create(parsed.data), {
      status: 201,
    });
  } catch (e) {
    if (e instanceof ConflictError) error(409, e.message);
    throw e;
  }
};
