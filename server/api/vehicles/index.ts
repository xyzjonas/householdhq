import vehicles from "~/server/controllers/vehicles";

export default defineEventHandler(async () => {
  const allVehicles = await vehicles.findAllVehicles();
  return {
    data: allVehicles,
  };
});
