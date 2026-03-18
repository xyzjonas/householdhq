import projects from "~/server/controllers/projects";
import {
  CreateProjectSchema,
  type CreateProjectRequest,
} from "~/types/project";
import doValidate from "~~/server/validators/validator";

export default defineEventHandler(async (event) => {
  const data: CreateProjectRequest = await doValidate(
    CreateProjectSchema,
    await readBody(event),
  );
  const response = await projects.createProject(data);
  setResponseStatus(event, 201);
  return {
    data: response,
    message: "created",
  };
});
