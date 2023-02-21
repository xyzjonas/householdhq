import { plainToClass, plainToInstance } from "class-transformer";
import tags from "~~/server/controllers/tags";
import { IdDto } from "~~/server/validators/transactions.dto";
import doValidate from "~~/server/validators/validator";
import { TagDto } from "../validators/tags.dto";


export default defineEventHandler(async (event) => {
    const data: TagDto = await doValidate(TagDto, await readBody(event));
    const response = await tags.createTag(data)
    setResponseStatus(event, 201);
    return {
        data: response,
        message: 'created'
    };
})