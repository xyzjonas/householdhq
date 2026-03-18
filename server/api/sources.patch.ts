import sources from "../controllers/sources";
import { EditSourceSchema, type EditSourceRequest } from "~/types/source";
import doValidate from "../validators/validator";

export default defineEventHandler(async (event) => {
  const data: EditSourceRequest = await doValidate(
    EditSourceSchema,
    await readBody(event),
  );
  const updatedSource = await sources.editSource(data);
  setResponseStatus(event, 200);
  return {
    data: updatedSource,
    message: "updated",
  };
});
