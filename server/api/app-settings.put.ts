import { appSettings } from '~/server/controllers';
import { UpdateAppSettingSchema } from '~/types/appSettings';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);

    // Validate request body
    const validatedData = UpdateAppSettingSchema.parse(body);

    const updatedSettings = await appSettings.updateSettings(validatedData);
    return {
      data: updatedSettings,
      message: 'Settings updated successfully',
    };
  } catch (error) {
    if (error instanceof Error) {
      throw createError({
        statusCode: 400,
        statusMessage: error.message,
      });
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update settings',
    });
  }
});
