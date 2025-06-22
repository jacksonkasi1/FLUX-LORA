# FLUX LoRA Server

AWS Lambda serverless backend for the FLUX LoRA Training Platform.

## 🏗️ Architecture

### AWS Services
- **AWS Lambda**: Serverless functions for API endpoints
- **DynamoDB**: NoSQL database for data storage
- **S3**: Object storage for images and model files
- **API Gateway**: HTTP API routing and CORS handling
- **CloudWatch**: Logging and monitoring

### Functions Structure
```
functions/
├── auth/           # Authentication (register, login, profile)
├── settings/       # User settings and API key management
├── models/         # Training model CRUD operations
├── images/         # Training and generated image management
└── upload/         # File upload with presigned URLs
```

## 📋 Prerequisites

- **AWS Account** with appropriate permissions
- **Node.js 18+** and **pnpm**
- **Serverless Framework** (`pnpm install -g serverless`)
- **AWS CLI** configured with credentials

## 🛠️ Setup

### 1. Install Dependencies
```bash
cd server
pnpm install
```

### 2. Configure Environment Variables
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
# AWS Configuration
AWS_ACCESS_KEY_ID=your_aws_access_key_here
AWS_SECRET_ACCESS_KEY=your_aws_secret_key_here
AWS_REGION=us-east-1

# DynamoDB Configuration
DYNAMODB_TABLE_PREFIX=flux-lora-backend-dev

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# CORS Configuration
CORS_ORIGIN=http://localhost:5173

# FAL.AI Configuration (server-side operations)
FALAI_API_KEY=your_falai_api_key_here

# Stage Configuration
STAGE=dev
```

### 3. Build and Type Check
```bash
# Build TypeScript
pnpm run build

# Type checking
pnpm run type-check

# Linting
pnpm run lint
```

## 🚀 Development

### Local Development
```bash
# Start serverless offline
pnpm run offline
```
Server runs on `http://localhost:3001`

### Development Commands
```bash
# Build with watch mode
pnpm run build:watch

# Fix linting issues
pnpm run lint:fix
```

## 📦 Deployment

### Deploy to Development
```bash
pnpm run deploy:dev
```

### Deploy to Production
```bash
pnpm run deploy:prod
```

### Remove Deployment
```bash
pnpm run remove
```

### View Logs
```bash
pnpm run logs -- functionName
```

## 🗄️ Database Schema

### DynamoDB Tables
- **user-settings**: User profiles, encrypted API keys
- **training-models**: Model metadata, training status
- **training-images**: Image records, deduplication hashes
- **generated-images**: Generated image records, prompts

### S3 Bucket Structure
```
flux-lora-api-{stage}-storage/
├── training-images/    # User uploaded training images
├── generated-images/   # AI generated images
└── models/            # Trained model files
```

## 🔧 API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /auth/profile` - Get user profile
- `PUT /auth/profile` - Update user profile

### Settings
- `GET /settings` - Get user settings
- `PUT /settings` - Update user settings

### Training Models
- `GET /models` - List training models
- `POST /models` - Create training model
- `GET /models/{id}` - Get training model
- `PUT /models/{id}` - Update training model
- `DELETE /models/{id}` - Delete training model

### Images
- `GET /models/{modelId}/images` - List training images
- `POST /models/{modelId}/images` - Upload training image
- `DELETE /images/{id}` - Delete training image
- `GET /generated-images` - List generated images
- `POST /generated-images` - Create generated image
- `PUT /generated-images/{id}` - Update generated image
- `DELETE /generated-images/{id}` - Delete generated image

### Upload
- `POST /upload/presigned` - Get presigned upload URL

## 🔒 Security

- **JWT Authentication**: Secure token-based auth
- **IAM Roles**: Minimal required permissions
- **CORS Protection**: Configurable origins
- **Input Validation**: Zod schema validation
- **Encrypted Storage**: API keys encrypted at rest

## 📊 Monitoring

### CloudWatch Integration
- **Function Logs**: All Lambda execution logs
- **Performance Metrics**: Duration, memory usage, errors
- **Custom Metrics**: Business logic metrics
- **Alarms**: Error rate and performance alerts

### Debug Commands
```bash
# View deployment info
serverless info

# View specific function logs
serverless logs -f auth-login --tail

# View all logs
pnpm run logs
```

## 🔧 Configuration

### Environment Variables
- `AWS_REGION`: AWS region for all resources
- `DYNAMODB_TABLE_PREFIX`: Prefix for DynamoDB tables
- `JWT_SECRET`: Secret for JWT token signing
- `CORS_ORIGIN`: Allowed CORS origins
- `FALAI_API_KEY`: FAL.AI API key for model training
- `STAGE`: Deployment stage (dev/prod)

### Serverless Configuration
See `serverless.yml` for:
- Lambda function configurations
- DynamoDB table definitions
- S3 bucket setup
- API Gateway routing
- IAM permissions

## 🚨 Troubleshooting

### Common Issues
1. **Deployment Fails**: Check AWS credentials and permissions
2. **CORS Errors**: Verify `CORS_ORIGIN` environment variable
3. **Database Errors**: Check DynamoDB table names and region
4. **Authentication Issues**: Verify JWT secret configuration

### Debug Steps
1. Check CloudWatch logs for errors
2. Verify environment variables are set
3. Test API endpoints with curl or Postman
4. Check AWS resource creation in console

## 🔄 CI/CD Integration

### GitHub Actions Example
```yaml
name: Deploy Server
on:
  push:
    branches: [main]
    paths: ['server/**']

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd server && pnpm install
      - run: cd server && pnpm run deploy:prod
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
```

## 📈 Performance Optimization

### Lambda Optimization
- **Memory Allocation**: Tune based on function requirements
- **Cold Start**: Minimize bundle size with tree shaking
- **Provisioned Concurrency**: For consistent performance

### DynamoDB Optimization
- **On-Demand Billing**: Automatic scaling
- **GSI Design**: Efficient query patterns
- **Item Size**: Keep items under 400KB

### S3 Optimization
- **Lifecycle Policies**: Archive old files
- **CloudFront**: CDN for global distribution
- **Multipart Upload**: For large files

## 💰 Cost Management

### Cost Optimization Tips
1. **Right-size Lambda memory** based on actual usage
2. **Use DynamoDB on-demand** for variable workloads
3. **Implement S3 lifecycle policies** for old files
4. **Monitor CloudWatch costs** and set up billing alerts
5. **Use API Gateway caching** for frequently accessed data

### Monitoring Costs
- Set up AWS Cost Explorer alerts
- Monitor DynamoDB and Lambda usage
- Track S3 storage growth
- Review CloudWatch log retention policies
