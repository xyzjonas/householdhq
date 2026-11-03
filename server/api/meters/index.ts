// server/api/meters/index.get.ts

import meters from "~/server/controllers/meters";

export default defineEventHandler(async () => {
  const allMeters = await meters.findAllMeters();
  return {
    data: allMeters,
  };
});
