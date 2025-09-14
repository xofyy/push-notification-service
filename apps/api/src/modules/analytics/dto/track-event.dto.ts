export class TrackEventDto {
  type!: string;
  timestamp?: string;
  deviceId?: string;
  notificationId?: string;
  data?: Record<string, unknown>;
}

export class TrackBatchEventsDto {
  batchId?: string;
  events!: TrackEventDto[];
}

