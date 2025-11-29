import { Configuration } from './configuration';
import {
    ProjectsApi,
    DevicesApi,
    NotificationsApi,
    TemplatesApi,
    HealthApi,
    AnalyticsApi,
    WebhooksApi
} from './api';

// Point to the local Next.js proxy
// The proxy will inject the API Key server-side
// The Configuration object often has 'apiKey' property.
const apiConfig = new Configuration({
    basePath: '',
    apiKey: (name: string) => {
        // Prioritize Admin Secret if available
        if (name === 'X-Admin-Secret') return process.env.ADMIN_SECRET || '';
        // Fallback to API Key
        if (name === 'X-API-Key') return process.env.API_KEY || '';
        return '';
    }
});

export const projectsApi = new ProjectsApi(apiConfig);
export const devicesApi = new DevicesApi(apiConfig);
export const notificationsApi = new NotificationsApi(apiConfig);
export const templatesApi = new TemplatesApi(apiConfig);
export const healthApi = new HealthApi(apiConfig);
export const analyticsApi = new AnalyticsApi(apiConfig);
export const webhooksApi = new WebhooksApi(apiConfig);
