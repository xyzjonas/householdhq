import sources from "../controllers/sources";
import { CreateSourceDto } from "../validators/sources.dto";
import doValidate from "../validators/validator";


export default defineEventHandler(async (event) => {
    const data: CreateSourceDto = await doValidate(CreateSourceDto, await readBody(event));
    const createdSource = await sources.createSource(data)
    setResponseStatus(event, 201);
    return {
        data: createdSource,
        message: 'created'
    };
})