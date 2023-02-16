import { plainToInstance } from "class-transformer";
import { validate, ValidationArguments, ValidationError, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";


@ValidatorConstraint({ name: 'customText', async: false })
export class ValidDate implements ValidatorConstraintInterface {
  validate(text: string) {
    return !Number.isNaN(new Date(text).getDate())
  }

  defaultMessage(args: ValidationArguments) {
    return '\'$value\' is not a valid Date!';
  }
}


const doValidate = (
    type: any,
    body: object,
    // body: body
    skipMissingProperties = false,
    whitelist = true,
    forbidNonWhitelisted = true,
): any => {
    console.debug(`Validating data: ${body}`)
    return validate(
        plainToInstance(type, body),
        { skipMissingProperties, whitelist, forbidNonWhitelisted }
    ).then((errors: ValidationError[]) => {
        if (errors.length > 0) {
            const message = errors.map((error: ValidationError) => Object.values(error.constraints)).join(', ');
            throw createError({
                statusCode: 400,
                statusMessage: message
            })
        } else {
            console.debug(`Data OK: ${plainToInstance(type, body)}`)
            return plainToInstance(type, body)
        }
    });
};


export default doValidate;