import type { LiveSyncChannelMessage, LiveSyncChannelTopic } from '@ai-pass/shared';

export type LiveSyncChannelSubscriber = (message: LiveSyncChannelMessage) => void;

/**
 * In-process event bus for real-time sync layer updates.
 * Web app exposes this via SSE; desktop/mobile subscribe through HTTP.
 */
export class LiveSyncChannelBus {
  private subscribers = new Set<LiveSyncChannelSubscriber>();
  private history: LiveSyncChannelMessage[] = [];
  private maxHistory = 500;

  subscribe(handler: LiveSyncChannelSubscriber): () => void {
    this.subscribers.add(handler);
    return () => this.subscribers.delete(handler);
  }

  publish<T>(topic: LiveSyncChannelTopic, payload: T): LiveSyncChannelMessage<T> {
    const message: LiveSyncChannelMessage<T> = {
      topic,
      timestamp: new Date().toISOString(),
      payload,
    };

    this.history.push(message as LiveSyncChannelMessage);
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }

    for (const subscriber of this.subscribers) {
      try {
        subscriber(message as LiveSyncChannelMessage);
      } catch {
        // Subscriber errors must not break the bus
      }
    }

    return message;
  }

  getHistory(since?: string, topic?: LiveSyncChannelTopic): LiveSyncChannelMessage[] {
    return this.history.filter((m) => {
      if (since && m.timestamp < since) return false;
      if (topic && m.topic !== topic) return false;
      return true;
    });
  }

  subscriberCount(): number {
    return this.subscribers.size;
  }
}
