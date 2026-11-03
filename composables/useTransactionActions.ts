import type { CreateUpdateTransaction } from "~/types";

/**
 * Mutations of single transactions. Every successful change refreshes all
 * home widgets, as it may affect any of them.
 */
export const useTransactionActions = () => {
  const { t } = useI18n();
  const { addNotification } = useNotifications();
  const pending = ref(false);

  const run = async (action: () => Promise<unknown>, success: string) => {
    pending.value = true;
    try {
      await action();
      await refreshHome();
      addNotification({ text: success, level: "success" });
      return true;
    } catch {
      addNotification({ text: t("server_error_500"), level: "error" });
      return false;
    } finally {
      pending.value = false;
    }
  };

  const create = (data: CreateUpdateTransaction) =>
    run(
      () => $fetch("/api/transactions", { method: "PUT", body: data }),
      t("t_added"),
    );

  const update = (data: CreateUpdateTransaction) =>
    run(
      () => $fetch("/api/transactions", { method: "PATCH", body: data }),
      t("t_editted"),
    );

  const confirm = (id: number, transactedAt: Date | string, recurring = 0) =>
    run(
      () =>
        $fetch("/api/transactions", {
          method: "PATCH",
          body: { id, confirmed: true, transactedAt },
        }),
      recurring > 0 ? t("t_confirmed_reccuring") : t("t_confirmed"),
    );

  const remove = (id: number) =>
    run(
      () => $fetch("/api/transactions", { method: "DELETE", body: { id } }),
      t("delete"),
    );

  return { pending, create, update, confirm, remove };
};
