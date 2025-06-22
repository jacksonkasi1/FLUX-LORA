# FLUX LoRA Training Platform

A modern web application for training and managing FLUX LoRA models with AWS Lambda serverless backend.

## 🚀 Overview

Train custom FLUX LoRA models with your own images and generate AI art using a modern React frontend backed by AWS Lambda functions.

**Key Features:**
- User authentication and profile management
- Upload and manage training images
- Train custom FLUX LoRA models
- Generate images with trained models
- Cloud storage with AWS S3
- Serverless architecture with AWS Lambda

## 🏗️ Architecture

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: AWS Lambda + DynamoDB + S3
- **Authentication**: JWT-based auth
- **AI Integration**: FAL.AI for FLUX LoRA training

## 📋 Prerequisites

- **Node.js 18+** and **pnpm**
- **AWS Account** with appropriate permissions
- **FAL.AI API Key** for model training

## 🛠️ Quick Start

### 1. Clone and Install
```bash
git clone <your-repo-url>
cd flux-lora
pnpm install
```

### 2. Frontend Setup
```bash
# Copy and configure frontend environment
cp .env.example .env
```

Edit `.env`:
```env
# API Configuration - Backend API URL
VITE_API_BASE_URL=http://localhost:3001

# FAL.AI API Configuration - Required for FLUX LoRA training
VITE_FALAI_API_KEY=your_falai_api_key_here
```

### 3. Backend Setup
```bash
cd server
pnpm install
cp .env.example .env
# Configure server environment variables (see server/README.md)
```

### 4. Development
```bash
# Start backend (from server directory)
cd server && pnpm run offline

# Start frontend (from root directory)
pnpm run dev
```

Visit `http://localhost:5173`

## 📦 Deployment

### Backend Deployment
For detailed server deployment instructions, see **[server/README.md](./server/README.md)**

Quick deployment:
```bash
cd server
pnpm run deploy:dev  # or deploy:prod
```

### Frontend Deployment
```bash
# Build frontend
pnpm run build

# Deploy dist/ folder to your hosting service
# (Vercel, Netlify, S3, etc.)
```

Update frontend `.env` after backend deployment:
```env
VITE_API_BASE_URL=https://your-api-gateway-url.amazonaws.com/dev
```

## 📁 Project Structure

```
flux-lora/
├── src/                 # Frontend React application
├── server/              # AWS Lambda backend
│   ├── functions/       # Lambda function handlers
│   ├── services/        # Business logic
│   ├── lib/            # Shared utilities
│   └── README.md       # 📖 Detailed server docs & deployment
├── public/             # Static assets
└── README.md          # This file
```

## 🔧 Environment Variables

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:3001
VITE_FALAI_API_KEY=your_falai_api_key_here
```

### Backend (server/.env)
See **[server/README.md](./server/README.md)** for complete server configuration.

## 📚 Documentation

- **[Server Documentation](./server/README.md)** - Detailed backend setup, deployment, and API docs

## 🧪 Development Commands

```bash
# Frontend
pnpm run dev          # Start development server
pnpm run build        # Build for production
pnpm run lint         # Run linting

# Backend (from server/ directory)
pnpm run offline      # Start local Lambda functions
pnpm run deploy:dev   # Deploy to AWS development
pnpm run deploy:prod  # Deploy to AWS production
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License

## 🆘 Support

- **Server Issues**: See [server/README.md](./server/README.md)
- **General Questions**: Open an issue on GitHub
