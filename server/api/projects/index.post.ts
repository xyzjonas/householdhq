import projects from "~/server/controllers/projects";
import { CreateProjectDto } from "~/server/validators/projects.dto";
import doValidate from "~~/server/validators/validator";


export default defineEventHandler(async (event) => {
    const data: CreateProjectDto = await doValidate(CreateProjectDto, await readBody(event));
    const response = await projects.createProject(data)
    setResponseStatus(event, 201);
    return {
        data: response,
        message: 'created'
    };
})