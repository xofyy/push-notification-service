import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  // Environment
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(3000),

  // CORS
  ALLOWED_ORIGINS: Joi.string().default('http://localhost:3000'),

  // Database
  MONGODB_URI: Joi.string().required(),
  MONGODB_URI_TEST: Joi.string().optional(),

  // Redis
  REDIS_URL: Joi.string().optional(),
  UPSTASH_REDIS_URL: Joi.string().optional(),
  UPSTASH_REDIS_TOKEN: Joi.string().optional(),

  // Push Providers
  FCM_PROJECT_ID: Joi.string().optional(),
  FCM_PRIVATE_KEY: Joi.string().optional(),
  FCM_CLIENT_EMAIL: Joi.string().optional(),

  APNS_KEY_ID: Joi.string().optional(),
  APNS_TEAM_ID: Joi.string().optional(),
  APNS_BUNDLE_ID: Joi.string().optional(),
  APNS_PRIVATE_KEY: Joi.string().optional(),
  APNS_PRODUCTION: Joi.boolean().default(false),

  VAPID_PUBLIC_KEY: Joi.string().optional(),
  VAPID_PRIVATE_KEY: Joi.string().optional(),
  VAPID_SUBJECT: Joi.string().optional(),

  // Security
  JWT_SECRET: Joi.string()
    .min(32)
    .default('your-super-secret-jwt-key-here-change-in-production'),
  API_RATE_LIMIT: Joi.number().default(100),

  // Feature Flags
  ENABLE_WEBHOOKS: Joi.boolean().default(true),
  ENABLE_ANALYTICS: Joi.boolean().default(true),
  ENABLE_SCHEDULING: Joi.boolean().default(true),
});
