import type { LiveSyncMetrics } from '@ai-pass/shared';

export function formatPrometheusMetrics(
  metrics: LiveSyncMetrics,
  labels: Record<string, string> = {}
): string {
  const labelStr = Object.entries(labels)
    .map(([k, v]) => `${k}="${v}"`)
    .join(',');
  const suffix = labelStr ? `{${labelStr}}` : '';

  return [
    `# HELP livesync_events_per_second Current event ingestion rate`,
    `# TYPE livesync_events_per_second gauge`,
    `livesync_events_per_second${suffix} ${metrics.eventsPerSecond}`,
    `# HELP livesync_queue_length Pending queue depth`,
    `# TYPE livesync_queue_length gauge`,
    `livesync_queue_length${suffix} ${metrics.queueLength}`,
    `# HELP livesync_avg_processing_ms Average processing latency`,
    `# TYPE livesync_avg_processing_ms gauge`,
    `livesync_avg_processing_ms${suffix} ${metrics.avgProcessingMs}`,
    `# HELP livesync_failure_rate Processing failure ratio`,
    `# TYPE livesync_failure_rate gauge`,
    `livesync_failure_rate${suffix} ${metrics.failureRate}`,
    `# HELP livesync_dead_letter_count Dead letter queue size`,
    `# TYPE livesync_dead_letter_count gauge`,
    `livesync_dead_letter_count${suffix} ${metrics.deadLetterCount}`,
  ].join('\n');
}
