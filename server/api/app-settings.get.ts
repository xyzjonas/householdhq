import { appSettings } from '~/server/controllers';

export default defineEventHandler(async () => {
  try {
    const settings = await appSettings.getSettings();
    return {
      data: settings,
      message: 'Settings retrieved successfully',
    };
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to retrieve settings',
    });
  }
});
