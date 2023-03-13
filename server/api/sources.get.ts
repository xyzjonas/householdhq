import { plainToClass, plainToInstance } from "class-transformer";
import sources from "../controllers/sources";
import { IdDto } from "../validators/sources.dto";
import doValidate from "~~/server/validators/validator";


export default defineEventHandler(async (event) => {
    const data = await sources.findAll();
    return {
        count: data.length,
        data: data,
        message: 'findAll'
    };
})