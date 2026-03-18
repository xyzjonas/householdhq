import sources from "../../controllers/sources";
import {
  UpdateSourceStateSchema,
  type UpdateSourceStateRequest,
} from "~/types/source";
import doValidate from "../../validators/validator";

export default defineEventHandler(async (event) => {
  const data: UpdateSourceStateRequest = await doValidate(
    UpdateSourceStateSchema,
    await readBody(event),
  );
  const createdState = await sources.insertState(data);
  setResponseStatus(event, 201);
  return {
    data: createdState,
    message: "created",
  };
});
