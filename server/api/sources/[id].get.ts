import { sources } from "@/server/controllers";
import { IdDto } from "@/server/validators/common.dto";
import doValidate from "@/server/validators/validator";


export default defineEventHandler(async (event) => {
    const data = await doValidate(IdDto, event.context.params);
    const source = await sources.findSingle(data);
    return { data: source };
})