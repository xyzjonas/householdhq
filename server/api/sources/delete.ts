import sources from "../../controllers/sources";
import { IdDto } from "../../validators/sources.dto";
import doValidate from "../../validators/validator";


export default defineEventHandler(async (event) => {
    const data: IdDto = await doValidate(IdDto, await readBody(event));
    const deletedState = await sources.deleteState(data);
    setResponseStatus(event, 200);
    return {
        data: deletedState,
        message: 'deleted'
    };
})