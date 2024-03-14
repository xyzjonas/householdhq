
export type AddNotification = {
  icon?: string
  title?: string
  text: string
  level?: "info" | "warning" | "success" | "error"
}

export type Notification = {
  icon?: string
  title?: string
  text: string
  level?: "info" | "warning" | "success" | "error"
  created: Date
}


const notifications = ref<Notification[]>([])

export const useNotifications = () => {

  const addNotification = (notification: AddNotification, timeout?: number) => {
    const createdAt = new Date();
    notifications.value.push({
      ...notification,
      created: createdAt,
    })
    setTimeout(() => notifications.value = notifications.value.filter(n => n.created !== createdAt), timeout ?? 2000)
  }

  return {
    notifications,
    addNotification,
  }


}