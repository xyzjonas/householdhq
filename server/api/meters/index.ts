// server/api/meters/index.get.ts

import meters from "~/server/controllers/meters";

export default defineEventHandler(async (event) => {
  const allMeters = await meters.findAllMeters();
  return {
    data: allMeters,
  };
});

// // server/api/meters/index.post.ts
// import MetersService, { MeterCreateSchema } from "~/server/services/meters";

// export default defineEventHandler(async (event) => {
//   const body = await readBody(event);
//   const validatedData = MeterCreateSchema.parse(body);
//   return await MetersService.createMeter(validatedData);
// });

// // server/api/meters/[id].get.ts
// import MetersService, { IDBaseSchema } from "~/server/services/meters";

// export default defineEventHandler(async (event) => {
//   const id = parseInt(event.context.params?.id || "0");
//   const validatedData = IDBaseSchema.parse({ id });
//   return await MetersService.findSingleMeter(validatedData);
// });

// // server/api/meters/[id].put.ts
// import MetersService, { MeterUpdateSchema } from "~/server/services/meters";

// export default defineEventHandler(async (event) => {
//   const id = parseInt(event.context.params?.id || "0");
//   const body = await readBody(event);
//   const validatedData = MeterUpdateSchema.parse({ ...body, id });
//   return await MetersService.editMeter(validatedData);
// });

// // server/api/meters/[id].delete.ts
// import MetersService, { IDBaseSchema } from "~/server/services/meters";

// export default defineEventHandler(async (event) => {
//   const id = parseInt(event.context.params?.id || "0");
//   const validatedData = IDBaseSchema.parse({ id });
//   return await MetersService.deleteMeter(validatedData);
// });

// // server/api/meter-states/index.get.ts
// import MetersService from "~/server/services/meters";

// export default defineEventHandler(async (event) => {
//   const query = getQuery(event);
//   const meterId = query.meterId ? parseInt(query.meterId as string) : undefined;
//   return await MetersService.findAllMeterStates(meterId);
// });

// // server/api/meter-states/index.post.ts
// import MetersService, { MeterStateCreateSchema } from "~/server/services/meters";

// // server/api/meter-states/[id].get.ts
// import MetersService, { IDBaseSchema } from "~/server/services/meters";

// export default defineEventHandler(async (event) => {
//   const id = parseInt(event.context.params?.id || "0");
//   const validatedData = IDBaseSchema.parse({ id });
//   return await MetersService.findSingleMeterState(validatedData);
// });

// // server/api/meter-states/[id].put.ts
// import MetersService, { MeterStateUpdateSchema } from "~/server/services/meters";

// export default defineEventHandler(async (event) => {
//   const id = parseInt(event.context.params?.id || "0");
//   const body = await readBody(event);
//   const validatedData = MeterStateUpdateSchema.parse({ ...body, id });
//   return await MetersService.editMeterState(validatedData);
// });
