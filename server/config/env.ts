/**
 * Server environment configuration
 * Environment variables for server-side operations
 */

// ** AWS Configuration
export const awsConfig = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  region: process.env.AWS_REGION || 'us-east-1',
} as const;

// ** Database Configuration
export const databaseConfig = {
  tablePrefix: process.env.DYNAMODB_TABLE_PREFIX || 'flux-lora-backend-dev',
  tables: {
    userSettings: `${process.env.DYNAMODB_TABLE_PREFIX || 'flux-lora-backend-dev'}-user-settings`,
    trainingModels: `${process.env.DYNAMODB_TABLE_PREFIX || 'flux-lora-backend-dev'}-training-models`,
    trainingImages: `${process.env.DYNAMODB_TABLE_PREFIX || 'flux-lora-backend-dev'}-training-images`,
    generatedImages: `${process.env.DYNAMODB_TABLE_PREFIX || 'flux-lora-backend-dev'}-generated-images`,
  },
} as const;

// ** Storage Configuration
export const storageConfig = {
  buckets: {
    trainingImages: `${process.env.DYNAMODB_TABLE_PREFIX || 'flux-lora-backend-dev'}-training-images`,
    generatedImages: `${process.env.DYNAMODB_TABLE_PREFIX || 'flux-lora-backend-dev'}-generated-images`,
    models: `${process.env.DYNAMODB_TABLE_PREFIX || 'flux-lora-backend-dev'}-models`,
  },
  presignedUrlExpiry: 3600, // 1 hour
} as const;

// ** Authentication Configuration
export const authConfig = {
  jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
  tokenExpiry: '7d',
  bcryptRounds: 12,
} as const;

// ** CORS Configuration
export const corsConfig = {
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
} as const;

// ** External Services Configuration
export const externalServices = {
  falaiApiKey: process.env.FALAI_API_KEY || '',
  falaiBaseUrl: 'https://fal.run/fal-ai',
} as const;

// ** Server Constants
export const serverConstants = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedImageTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  minTrainingImages: 2,
  maxTrainingImages: 50,
  defaultPagination: {
    limit: 20,
    maxLimit: 100,
  },
} as const;

/**
 * Validates that all required server environment variables are set
 */
export const validateServerEnvironment = (): void => {
  const requiredVars = [
    { key: 'AWS_ACCESS_KEY_ID', value: awsConfig.accessKeyId },
    { key: 'AWS_SECRET_ACCESS_KEY', value: awsConfig.secretAccessKey },
    { key: 'JWT_SECRET', value: authConfig.jwtSecret },
  ];

  const missingVars = requiredVars.filter(({ value }) => !value);

  if (missingVars.length > 0) {
    const missing = missingVars.map(({ key }) => key).join(', ');
    throw new Error(`Missing required server environment variables: ${missing}`);
  }
};

// ** Centralized server environment configuration export
export const serverEnv = {
  aws: {
    ...awsConfig,
    s3: storageConfig,
  },
  database: databaseConfig,
  auth: authConfig,
  cors: corsConfig,
  external: externalServices,
  constants: serverConstants,
} as const;

export const ENV = serverEnv;