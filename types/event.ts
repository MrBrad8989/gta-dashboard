export interface EventData {
  id: number;
  title: string;
  description: string;
  eventDate: Date;
  flyerUrl: string;
  needsCars: boolean;
  carsDesc?: string | null;
  needsRadio: boolean;
  needsMapping: boolean;
  mappingDesc?: string | null;
  mappingFiles?: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string | null;
  creatorId: number;
  subscribers: string[];
  publicMessageId?: string | null;
  ticketChannelId?: string | null;
  startNotified: boolean;
  createdAt: Date;
}
