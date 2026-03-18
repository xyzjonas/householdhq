import doValidate from "~~/server/validators/validator";
import { LoginSchema, type LoginRequest } from "~~/types/auth";

export default defineEventHandler(async (event) => {
  const data: LoginRequest = await doValidate(
    LoginSchema,
    await readBody(event),
  );
  if (!validatePassword(data.username ?? "N/A", data.password ?? "N/A")) {
    setResponseStatus(event, 401);
    return { reason: "invalid username or password" };
  }

  // todo: sessions in database
  const token = encodeSession({
    id: 1,
    username: data.username ?? "N/A",
  });
  return {
    token: token,
  };
});
