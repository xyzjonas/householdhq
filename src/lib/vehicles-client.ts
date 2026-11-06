import type { VehicleComponent } from "#lib/server/core/types.ts";

/** Creates a service component; resolves to the saved component. */
export async function createComponent(input: {
  name: string;
  color?: string | null;
}): Promise<VehicleComponent> {
  const res = await fetch("/api/vehicle-components", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as {
      message?: string;
    } | null;
    throw new Error(
      body?.message ?? `Could not add the component (${res.status})`,
    );
  }
  return res.json();
}
