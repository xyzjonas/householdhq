import projects from "~/server/controllers/projects";
import { EditProjectSchema, type EditProjectRequest } from "~/types/project";
import doValidate from "../../validators/validator";

export default defineEventHandler(async (event) => {
  const data: EditProjectRequest = await doValidate(
    EditProjectSchema,
    await readBody(event),
  );
  const updatedSource = await projects.editProject(data);
  setResponseStatus(event, 200);
  return {
    data: updatedSource,
    message: "updated",
  };
});
