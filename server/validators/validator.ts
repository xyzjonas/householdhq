import { isString } from "@vue/shared";
import { plainToInstance } from "class-transformer";
import { validate, ValidationArguments, ValidationError, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";


@ValidatorConstraint({ name: 'IsDate', async: false })
export class ValidDate implements ValidatorConstraintInterface {
  validate(text: string) {
    return !Number.isNaN(new Date(text).getDate())
  }

  defaultMessage(args: ValidationArguments) {
    return '\'$value\' is not a valid Date!';
  }
}

@ValidatorConstraint({ name: 'IsStringArray', async: false })
export class ValidArray implements ValidatorConstraintInterface {
  validate(text: string) {
    return Array.isArray(text) && text.length > 0;
  }

  defaultMessage(args: ValidationArguments) {
    return '\'$value\' is not a valid array or is empty.';
  }
}



const doValidate = async (
    type: any,
    body: object,
    skipMissingProperties = false,
    whitelist = true,
    forbidNonWhitelisted = true,
): Promise<any> => {
    // console.debug(`Validating data:`)
    console.debug(body);
    const data = plainToInstance(type, body);
    const errors = await validate(data, { skipMissingProperties, whitelist, forbidNonWhitelisted })
    console.info('--------------------');
    console.info(errors);
    console.info('--------------------');
    console.info(data);
    console.info('--------------------');
    
    if (errors.length > 0) {
        const message = errors.map((error: ValidationError) => Object.values(error.constraints)).join(', ');
        throw createError({
            statusCode: 400,
            statusMessage: message
        })
    }

    console.debug(`Data OK: ${plainToInstance(type, body)}`)
    return data;
};


export default doValidate;