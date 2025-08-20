export default () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  environment: process.env.NODE_ENV || 'development',

  cors: {
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || [
      'http://localhost:3000',
    ],
  },

  database: {
    mongodb: {
      uri: process.env.MONGODB_URI,
      testUri: process.env.MONGODB_URI_TEST,
    },
  },

  redis: {
    url: process.env.REDIS_URL,
    upstash: {
      url: process.env.UPSTASH_REDIS_URL,
      token: process.env.UPSTASH_REDIS_TOKEN,
    },
  },

  pushProviders: {
    fcm: {
      projectId: process.env.FCM_PROJECT_ID,
      privateKey: process.env.FCM_PRIVATE_KEY,
      clientEmail: process.env.FCM_CLIENT_EMAIL,
    },
    apns: {
      keyId: process.env.APNS_KEY_ID,
      teamId: process.env.APNS_TEAM_ID,
      bundleId: process.env.APNS_BUNDLE_ID,
      privateKey: process.env.APNS_PRIVATE_KEY,
      production: process.env.APNS_PRODUCTION === 'true',
    },
    webPush: {
      vapidPublicKey: process.env.VAPID_PUBLIC_KEY,
      vapidPrivateKey: process.env.VAPID_PRIVATE_KEY,
      vapidSubject: process.env.VAPID_SUBJECT,
    },
  },

  security: {
    jwtSecret: process.env.JWT_SECRET,
    rateLimitMax: parseInt(process.env.API_RATE_LIMIT || '100', 10),
  },

  features: {
    webhooks: process.env.ENABLE_WEBHOOKS === 'true',
    analytics: process.env.ENABLE_ANALYTICS === 'true',
    scheduling: process.env.ENABLE_SCHEDULING === 'true',
  },

  monitoring: {
    sentryDsn: process.env.SENTRY_DSN,
    mixpanelToken: process.env.MIXPANEL_TOKEN,
  },
});
