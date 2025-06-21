# FLUX LoRA Training Platform

A modern web application for training and managing FLUX LoRA models with AWS Lambda backend.

## 🚀 Features

- **User Authentication**: Secure JWT-based authentication
- **Model Training**: Train custom FLUX LoRA models with your images
- **Image Management**: Upload, organize, and manage training images
- **Generated Images**: Create and manage AI-generated images
- **Cloud Storage**: AWS S3 integration for file storage
- **Serverless Backend**: AWS Lambda functions with DynamoDB
- **Modern UI**: Built with React, TypeScript, and Tailwind CSS

## 🏗️ Architecture

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **shadcn/ui** for UI components
- **React Query** for data fetching and caching
- **React Router** for navigation

### Backend
- **AWS Lambda** functions for API endpoints
- **DynamoDB** for data storage
- **S3** for file storage
- **API Gateway** for HTTP routing
- **Serverless Framework** for deployment

## 📋 Prerequisites

- Node.js 18 or higher
- pnpm package manager
- AWS Account with appropriate permissions
- FAL.AI API key for model training

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd flux-lora
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your AWS credentials and API keys:
   ```env
   AWS_ACCESS_KEY_ID=your_aws_access_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret_key
   AWS_REGION=us-east-1
   JWT_SECRET=your-jwt-secret
   VITE_API_BASE_URL=http://localhost:3001
   VITE_FALAI_API_KEY=your_falai_api_key
   ```

## 🚀 Development

### Start Backend (Lambda functions locally)
```bash
pnpm run offline
```

### Start Frontend Development Server
```bash
pnpm run dev
```

The application will be available at `http://localhost:5173`

## 📦 Deployment

### Deploy to AWS
```bash
# Development environment
pnpm run deploy:dev

# Production environment
pnpm run deploy:prod
```

### Build Frontend
```bash
pnpm run build
```

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)

## 🗄️ Database Schema

### User Settings
- User profiles and preferences
- Encrypted API keys
- Account information

### Training Models
- Model metadata and configuration
- Training status and progress
- Model files and thumbnails

### Training Images
- Image metadata and URLs
- Associated training models
- Deduplication hashes

### Generated Images
- Generated image records
- Prompts and configuration
- Favorites and metadata

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

### Training Images
- `GET /models/{modelId}/images` - List training images
- `POST /models/{modelId}/images` - Upload training image
- `DELETE /images/{id}` - Delete training image

### Generated Images
- `GET /generated-images` - List generated images
- `POST /generated-images` - Create generated image
- `PUT /generated-images/{id}` - Update generated image
- `DELETE /generated-images/{id}` - Delete generated image

### File Upload
- `POST /upload/presigned` - Get presigned upload URL

## 🔒 Security

- JWT-based authentication
- Encrypted API key storage
- CORS protection
- Input validation and sanitization
- Secure file upload with presigned URLs
- Row-level security with user ownership checks

## 🎨 UI Components

Built with shadcn/ui components:
- Forms and inputs
- Dialogs and modals
- Navigation and menus
- Data tables and lists
- Progress indicators
- Toast notifications

## 📱 Responsive Design

- Mobile-first approach
- Responsive layouts
- Touch-friendly interfaces
- Progressive web app features

## 🧪 Testing

```bash
# Run linting
pnpm run lint

# Type checking
pnpm run type-check
```

## 📊 Monitoring

- CloudWatch logs for Lambda functions
- Error tracking and alerting
- Performance monitoring
- Cost tracking and optimization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For deployment issues, see [DEPLOYMENT.md](./DEPLOYMENT.md)

For general questions, please open an issue on GitHub.

## 🔄 Migration from Supabase

This project has been migrated from Supabase to AWS Lambda. Key changes:

- **Authentication**: Custom JWT implementation
- **Database**: DynamoDB instead of PostgreSQL
- **Storage**: S3 instead of Supabase Storage
- **API**: Lambda functions instead of Supabase Edge Functions
- **Real-time**: Polling instead of real-time subscriptions

The migration maintains the same functionality while providing better scalability and cost control.
