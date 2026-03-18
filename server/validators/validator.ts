import type { ZodSchema } from "zod";

const doValidate = async <T>(
  schema: ZodSchema<T>,
  data: unknown,
): Promise<T> => {
  const parsed = schema.safeParse(data);

  if (!parsed.success) {
    const message = parsed.error.issues
      .map((issue) => issue.message)
      .join(", ");
    throw createError({
      statusCode: 400,
      statusMessage: message,
    });
  }

  return parsed.data;
};

export default doValidate;
