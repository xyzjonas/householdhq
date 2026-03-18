import sources from "../controllers/sources";
import { CreateSourceSchema, type CreateSourceRequest } from "~/types/source";
import doValidate from "../validators/validator";

export default defineEventHandler(async (event) => {
  const data: CreateSourceRequest = await doValidate(
    CreateSourceSchema,
    await readBody(event),
  );
  const createdSource = await sources.createSource(data);
  setResponseStatus(event, 201);
  return {
    data: createdSource,
    message: "created",
  };
});
