/** Notification service stub — email, Slack, push */
export class NotificationService {
  async sendEmail(_params: { to: string; subject: string; body: string }): Promise<{ sent: boolean; stubbed: true }> {
    return { sent: true, stubbed: true };
  }

  async sendSlack(_params: { channel: string; message: string }): Promise<{ sent: boolean; stubbed: true }> {
    return { sent: true, stubbed: true };
  }

  async notifyEscalation(_params: { assigneeId: string; conversationId: string }): Promise<{ sent: boolean; stubbed: true }> {
    return { sent: true, stubbed: true };
  }
}
