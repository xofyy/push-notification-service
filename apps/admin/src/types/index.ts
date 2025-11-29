export interface Project {
    _id: string;
    name: string;
    description?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface DashboardStats {
    activeDevices: number;
    notificationsSent: number;
    deliveryRate: string;
    errors: number;
}

export interface Notification {
    _id: string;
    title: string;
    body: string;
    status: 'PENDING' | 'SENT' | 'DELIVERED' | 'FAILED' | 'CANCELLED' | 'SCHEDULED';
    type: 'INSTANT' | 'SCHEDULED' | 'RECURRING';
    createdAt: string;
    sentAt?: string;
    deliveredAt?: string;
    scheduledFor?: string;
    recurring?: {
        pattern: string;
        timezone: string;
        endDate?: string;
    };
}

export interface Template {
    _id: string;
    name: string;
    title: string;
    body: string;
    type: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Webhook {
    url: string;
    events: string[];
    secret: string;
    isActive: boolean;
    createdAt: string;
}
