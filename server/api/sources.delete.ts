import { IdDto } from "@/server/validators/common.dto";
import sources from "@/server/controllers/sources";
import doValidate from "@/server/validators/validator";


export default defineEventHandler(async (event) => {
    const data: IdDto = await doValidate(IdDto, await readBody(event));
    const deletedState = await sources.deleteSource(data);
    setResponseStatus(event, 200);
    return {
        data: deletedState,
        message: 'deleted'
    };
})