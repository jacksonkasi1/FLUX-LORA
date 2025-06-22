/**
 * AWS service configuration
 */

import { ENV } from '@server/config/env';

export const AWS_REGION = ENV.aws.region;
export const S3_BUCKET_NAME = ENV.aws.s3.buckets.trainingImages;

export const DYNAMODB_TABLES = {
  USER_SETTINGS: `${ENV.database.tables.userSettings}`,
  TRAINING_MODELS: `${ENV.database.tables.trainingModels}`,
  TRAINING_IMAGES: `${ENV.database.tables.trainingImages}`,
  GENERATED_IMAGES: `${ENV.database.tables.generatedImages}`,
} as const;

export const DYNAMODB_INDEXES = {
  USER_ID_INDEX: 'UserIdIndex',
  TRAINING_MODEL_ID_INDEX: 'TrainingModelIdIndex',
} as const;
