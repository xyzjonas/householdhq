import { plainToClass, plainToInstance } from "class-transformer";
import tags from "~~/server/controllers/tags";
import { IdDto } from "~~/server/validators/transactions.dto";
import doValidate from "~~/server/validators/validator";


export default defineEventHandler(async (event) => {
    console.info(event.context.params);
    const data = await doValidate(IdDto, event.context.params);
    return tags.findSingle(data);
})