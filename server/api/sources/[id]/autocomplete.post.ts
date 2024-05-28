import { sources } from "@/server/controllers";
import { IdDto } from "@/server/validators/common.dto";
import doValidate from "@/server/validators/validator";


export default defineEventHandler(async (event) => {
    const data = await doValidate(IdDto, event.context.params);


    const newState = await sources.autoInsertState(data);
    return { data: newState };
})