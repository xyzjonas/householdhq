import { prisma } from './prisma-client';
import type {
  AppSetting,
  UpdateAppSetting,
} from '~/types/appSettings';

const SETTINGS_ID = 1; // Singleton ID

/**
 * Get all settings (singleton)
 */
export const getSettings = async (): Promise<AppSetting> => {
  let settings = await prisma.appSettings.findUnique({
    where: { id: SETTINGS_ID },
  });

  // Initialize if doesn't exist
  if (!settings) {
    settings = await prisma.appSettings.create({
      data: {
        id: SETTINGS_ID,
        currency: 'USD',
        defaultFuelTransactionTitle: 'Fuel',
      },
    });
  }

  return settings;
};

/**
 * Update settings
 */
export const updateSettings = async (
  data: UpdateAppSetting
): Promise<AppSetting> => {
  // Ensure settings exist
  await getSettings();

  return prisma.appSettings.update({
    where: { id: SETTINGS_ID },
    data,
  });
};

/**
 * Get a specific setting value
 */
export const getSetting = async (key: keyof AppSetting): Promise<any> => {
  const settings = await getSettings();
  return settings[key];
};

/**
 * Initialize default settings
 */
export const initializeDefaultSettings = async (): Promise<AppSetting> => {
  const settings = await getSettings();
  return settings;
};
