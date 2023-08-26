import doValidate from "~~/server/validators/validator";
import { LoginDto } from "~~/server/validators/user.dto";


export default defineEventHandler(async (event) => {
    const data: LoginDto = await doValidate(LoginDto, await readBody(event));
    if (!validatePassword(data.username, data.password)) {
        setResponseStatus(event, 401);
        return { reason: 'invalid username or password' };
    }

    // todo: sessions in database
    const token = encodeSession({
        id: 1,
        username: data.username,
    })
    return {
        token: token
    };
})