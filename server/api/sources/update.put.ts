import sources from "../../controllers/sources";
import { UpdateSourceStateDto } from "../../validators/sources.dto";
import doValidate from "../../validators/validator";


export default defineEventHandler(async (event) => {
    const data: UpdateSourceStateDto = await doValidate(UpdateSourceStateDto, await readBody(event));
    const createdState = await sources.insertState(data);
    setResponseStatus(event, 201);
    return {
        data: createdState,
        message: 'created'
    };
})