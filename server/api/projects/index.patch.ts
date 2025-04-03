import projects from "~/server/controllers/projects";
import { EditProjectDto } from "~/server/validators/projects.dto";
import doValidate from "../../validators/validator";


export default defineEventHandler(async (event) => {
    const data: EditProjectDto = await doValidate(EditProjectDto, await readBody(event));
    const updatedSource = await projects.editProject(data)
    setResponseStatus(event, 200);
    return {
        data: updatedSource,
        message: 'updated'
    };
})