export default defineNuxtPlugin(async () => {
  const { settings, fetchSettings } = useAppSettings();

  if (settings.value) {
    return;
  }

  try {
    await fetchSettings();
  } catch {
    // Keep app usable even if settings cannot be loaded yet.
  }
});
