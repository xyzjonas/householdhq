import {
  AppSettingSchema,
  type AppSetting,
  type UpdateAppSetting,
} from "~/types/appSettings";

/**
 * Composable for accessing and managing app settings
 * Provides reactive access to global app settings
 */
export const useAppSettings = () => {
  const settings = useState<AppSetting | null>("app-settings", () => null);
  const isLoading = useState<boolean>("app-settings-loading", () => false);
  const error = useState<string | null>("app-settings-error", () => null);

  const normalizeSettings = (value: unknown): AppSetting =>
    AppSettingSchema.parse(value);

  /**
   * Fetch settings from server
   */
  const fetchSettings = async () => {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await $fetch<{ data: AppSetting }>("/api/app-settings");
      settings.value = normalizeSettings(response.data);
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to fetch settings";
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Update settings on server
   */
  const updateSettings = async (updates: UpdateAppSetting) => {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await $fetch<{ data: AppSetting }>("/api/app-settings", {
        method: "PUT",
        body: updates,
      });
      const normalizedSettings = normalizeSettings(response.data);
      settings.value = normalizedSettings;
      return normalizedSettings;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to update settings";
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Get a specific setting value
   */
  const getSetting = (key: keyof AppSetting): any => {
    return settings.value?.[key];
  };

  /**
   * Get currency setting
   */
  const getCurrency = (): string => {
    return getSetting("currency") || "USD";
  };

  /**
   * Update currency setting
   */
  const setCurrency = async (currency: string) => {
    return updateSettings({ currency });
  };

  /**
   * Update default title for auto-created fuel transactions
   */
  const setDefaultFuelTransactionTitle = async (defaultFuelTransactionTitle: string) => {
    return updateSettings({ defaultFuelTransactionTitle });
  };

  return {
    settings: readonly(settings),
    isLoading: readonly(isLoading),
    error: readonly(error),
    fetchSettings,
    updateSettings,
    getSetting,
    getCurrency,
    setCurrency,
    setDefaultFuelTransactionTitle,
  };
};
