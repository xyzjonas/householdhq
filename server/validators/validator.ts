import { plainToInstance, type ClassConstructor } from "class-transformer";
import {
  validate,
  type ValidationArguments,
  ValidationError,
  ValidatorConstraint,
  type ValidatorConstraintInterface,
} from "class-validator";

@ValidatorConstraint({ name: "IsDate", async: false })
export class ValidDate implements ValidatorConstraintInterface {
  validate(text: string) {
    return !Number.isNaN(new Date(text).getDate());
  }

  defaultMessage(args: ValidationArguments) {
    return "'$value' is not a valid Date!";
  }
}

@ValidatorConstraint({ name: "IsStringArray", async: false })
export class ValidArray implements ValidatorConstraintInterface {
  validate(text: string) {
    return Array.isArray(text) && text.length > 0;
  }

  defaultMessage(args: ValidationArguments) {
    return "'$value' is not a valid array or is empty.";
  }
}

const doValidate = async <T>(
  type: ClassConstructor<T>,
  body: any,
  skipMissingProperties = false,
  whitelist = true,
  forbidNonWhitelisted = true
): Promise<T> => {
  const data = plainToInstance(type, body);
  const errors = await validate(data as any, { skipMissingProperties, whitelist, forbidNonWhitelisted });

  if (errors.length > 0) {
    const message = errors.map((error: ValidationError) => Object.values(error.constraints ?? [])).join(", ");
    throw createError({
      statusCode: 400,
      statusMessage: message,
    });
  }

  return data;
};

export default doValidate;
