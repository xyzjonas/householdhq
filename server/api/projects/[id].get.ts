import projects from "~/server/controllers/projects";
import { IdSchema, type IDBase } from "~~/types/base";
import doValidate from "~~/server/validators/validator";

export default defineEventHandler(async (event) => {
  const data: IDBase = await doValidate(IdSchema, event.context.params);
  const proj = await projects.findSingle(data);
  return {
    data: proj,
  };
});
