export const notificationService = {
  async requestPermission(): Promise<boolean> {
    return false
  },

  async registerToken(): Promise<void> {},

  setupListeners(): () => void {
    return () => {}
  },
}
