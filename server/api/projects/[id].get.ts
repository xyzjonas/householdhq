import projects from "~/server/controllers/projects";
import { IdDto } from "~~/server/validators/common.dto";
import doValidate from "~~/server/validators/validator";


export default defineEventHandler(async (event) => {
    const data = await doValidate(IdDto, event.context.params);
    const proj = await projects.findSingle(data);
    return {
        data: proj
    };
})