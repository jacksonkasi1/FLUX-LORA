# AWS Lambda Deployment Guide

This guide will help you deploy your FLUX LoRA application using AWS Lambda and the Serverless Framework.

## Prerequisites

1. **AWS Account**: You need an active AWS account
2. **AWS CLI**: Install and configure AWS CLI with your credentials
3. **Node.js**: Version 18 or higher
4. **Serverless Framework**: Installed globally (`pnpm install -g serverless`)

## Setup Instructions

### 1. Configure AWS Credentials

Create a `.env` file in the root directory with your AWS credentials:

```bash
cp .env.example .env
```

Edit the `.env` file and add your AWS credentials:

```env
AWS_ACCESS_KEY_ID=your_aws_access_key_here
AWS_SECRET_ACCESS_KEY=your_aws_secret_key_here
AWS_REGION=us-east-1
JWT_SECRET=your-super-secret-jwt-key-change-in-production
CORS_ORIGIN=http://localhost:5173
VITE_API_BASE_URL=https://your-api-gateway-url.amazonaws.com/dev
VITE_FALAI_API_KEY=your_falai_api_key_here
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Deploy to AWS

#### Development Environment
```bash
pnpm run deploy:dev
```

#### Production Environment
```bash
pnpm run deploy:prod
```

### 4. Get API Gateway URL

After deployment, the Serverless Framework will output your API Gateway URL. Update your `.env` file with this URL:

```env
VITE_API_BASE_URL=https://your-api-gateway-url.amazonaws.com/dev
```

### 5. Build and Deploy Frontend

```bash
pnpm run build
```

Deploy the built frontend to your preferred hosting service (Vercel, Netlify, S3, etc.).

## Local Development

### 1. Start Lambda Functions Locally

```bash
pnpm run offline
```

This will start the Lambda functions locally on `http://localhost:3001`.

### 2. Start Frontend Development Server

```bash
pnpm run dev
```

This will start the Vite development server on `http://localhost:5173`.

## AWS Resources Created

The deployment will create the following AWS resources:

### DynamoDB Tables
- `flux-lora-api-{stage}-user-settings`: User settings and API keys
- `flux-lora-api-{stage}-training-models`: Training model records
- `flux-lora-api-{stage}-training-images`: Training image records
- `flux-lora-api-{stage}-generated-images`: Generated image records

### S3 Bucket
- `flux-lora-api-{stage}-storage`: File storage for images and models

### Lambda Functions
- Authentication functions (register, login, profile)
- Settings management functions
- Training model CRUD functions
- Image management functions
- File upload functions

### API Gateway
- REST API with CORS enabled
- Routes for all Lambda functions

### Cognito User Pool (Optional)
- User authentication and management
- Currently using JWT tokens for simplicity

## Environment Variables

### Backend (Lambda)
- `AWS_REGION`: AWS region for resources
- `DYNAMODB_TABLE_PREFIX`: Prefix for DynamoDB table names
- `S3_BUCKET`: S3 bucket name for file storage
- `JWT_SECRET`: Secret key for JWT token signing
- `CORS_ORIGIN`: Allowed CORS origin

### Frontend (Vite)
- `VITE_API_BASE_URL`: Base URL for API calls
- `VITE_FALAI_API_KEY`: FAL.AI API key for image generation

## Security Considerations

1. **JWT Secret**: Use a strong, unique JWT secret in production
2. **API Keys**: API keys are encrypted before storage (implement proper encryption)
3. **CORS**: Configure CORS_ORIGIN to match your frontend domain
4. **IAM Roles**: Lambda functions have minimal required permissions
5. **Environment Variables**: Never commit sensitive data to version control

## Monitoring and Logging

### CloudWatch Logs
All Lambda functions log to CloudWatch. View logs with:

```bash
pnpm run logs -- functionName
```

### Error Handling
- All API responses include proper error messages
- Failed operations are logged with details
- Database operations include error handling

## Scaling Considerations

### DynamoDB
- Uses on-demand billing mode
- Automatically scales based on traffic
- Consider provisioned capacity for predictable workloads

### Lambda
- Automatically scales based on requests
- Cold start optimization with webpack bundling
- Consider provisioned concurrency for consistent performance

### S3
- Automatically scales
- Consider CloudFront CDN for global distribution
- Implement lifecycle policies for cost optimization

## Cost Optimization

1. **DynamoDB**: Use on-demand billing for variable workloads
2. **Lambda**: Optimize memory allocation based on usage patterns
3. **S3**: Implement lifecycle policies to move old files to cheaper storage classes
4. **API Gateway**: Consider usage plans and throttling for cost control

## Troubleshooting

### Common Issues

1. **Deployment Fails**: Check AWS credentials and permissions
2. **CORS Errors**: Verify CORS_ORIGIN environment variable
3. **Database Errors**: Check DynamoDB table names and regions
4. **File Upload Issues**: Verify S3 bucket permissions and CORS configuration

### Debug Commands

```bash
# View deployment status
serverless info

# View function logs
serverless logs -f functionName

# Remove deployment
pnpm run remove
```

## Production Checklist

- [ ] Strong JWT secret configured
- [ ] CORS origin set to production domain
- [ ] API keys properly encrypted
- [ ] CloudWatch monitoring enabled
- [ ] Error alerting configured
- [ ] Backup strategy implemented
- [ ] Security audit completed
- [ ] Performance testing done
- [ ] Cost monitoring enabled
