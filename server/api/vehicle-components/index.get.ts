import vehicleComponents from "~/server/controllers/vehicleComponents";

export default defineEventHandler(async () => {
  const data = await vehicleComponents.findAll();
  return { data, count: data.length };
});
