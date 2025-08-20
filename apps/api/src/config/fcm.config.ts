import { registerAs } from '@nestjs/config';

export default registerAs('fcm', () => ({
  projectId: process.env.FCM_PROJECT_ID,
  serviceAccountPath: process.env.FCM_SERVICE_ACCOUNT_PATH,
  serviceAccountKey: process.env.FCM_SERVICE_ACCOUNT_KEY,
  enabled: process.env.FCM_ENABLED === 'true',
}));
