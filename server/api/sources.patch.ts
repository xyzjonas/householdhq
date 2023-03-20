import sources from "../controllers/sources";
import { EditSourceDto } from "../validators/sources.dto";
import doValidate from "../validators/validator";


export default defineEventHandler(async (event) => {
    const data: EditSourceDto = await doValidate(EditSourceDto, await readBody(event));
    const updatedSource = await sources.editSource(data)
    setResponseStatus(event, 200);
    return {
        data: updatedSource,
        message: 'updated'
    };
})