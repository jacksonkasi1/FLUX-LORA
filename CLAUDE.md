# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a FLUX LoRA Training Platform - a modern web application for training and managing FLUX LoRA models with an AWS serverless backend. The project has been migrated from Supabase to AWS Lambda with DynamoDB and S3.

## Common Development Commands

### Frontend Development
- `pnpm run dev` - Start Vite development server (port 8080)
- `pnpm run build` - Build frontend for production
- `pnpm run build:dev` - Build frontend in development mode
- `pnpm run lint` - Run ESLint on frontend code
- `pnpm run lint:fix` - Fix ESLint issues automatically
- `pnpm run type-check` - Run TypeScript type checking
- `pnpm run preview` - Preview production build locally

### Backend Development
- `pnpm run offline` - Start serverless offline (Lambda functions locally on port 3001)
- `pnpm run build:server` - Build server/Lambda functions
- `pnpm run lint:server` - Run ESLint on server code
- `pnpm run lint:fix:server` - Fix server ESLint issues
- `pnpm run type-check:server` - Run TypeScript checking on server

### Deployment
- `pnpm run deploy:dev` - Deploy to AWS development stage
- `pnpm run deploy:prod` - Deploy to AWS production stage
- `pnpm run deploy` - Deploy with default stage
- `pnpm run remove` - Remove serverless deployment
- `pnpm run logs` - View serverless logs

### Package Management
- **IMPORTANT**: Always use `pnpm` instead of `npm` for package management
- `pnpm install` - Install dependencies
- `cd server && pnpm install` - Install server dependencies

## Architecture

### Frontend (src/)
- **React 18** with TypeScript and Vite
- **UI Framework**: shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with class-variance-authority
- **State Management**: React Query for server state, React Context for auth
- **Routing**: React Router DOM
- **Forms**: React Hook Form with Zod validation
- **File Upload**: Custom drag-and-drop with JSZip support

### Backend (server/)
- **Runtime**: AWS Lambda (Node.js 18.x)
- **Framework**: Serverless Framework with esbuild
- **Database**: DynamoDB with document client
- **Storage**: S3 with presigned URLs
- **Authentication**: Custom JWT with bcrypt password hashing
- **API**: RESTful endpoints through API Gateway

### Key Backend Services
- **Authentication**: JWT-based auth with user registration/login
- **Training Models**: CRUD operations for LoRA model training
- **Image Management**: Upload and organize training/generated images
- **File Upload**: Presigned S3 URLs for secure file uploads
- **Database**: DynamoDB service with automatic timestamps

## Project Structure

### Frontend Structure
- `src/components/` - React components organized by feature
  - `auth/` - Authentication components
  - `gallery/` - Image gallery components  
  - `models/` - Model management components
  - `training/` - Training workflow components
  - `ui/` - shadcn/ui components
- `src/contexts/` - React contexts (AuthContext)
- `src/hooks/` - Custom React hooks organized by type
- `src/lib/` - Utilities and API clients
- `src/services/` - External service integrations (FAL.AI)
- `src/types/` - TypeScript type definitions

### Backend Structure
- `server/functions/` - Lambda function handlers by feature
  - `auth/` - Authentication (login, register, profile)
  - `models/` - Training model CRUD operations
  - `images/` - Training and generated image management
  - `settings/` - User settings and API key management
  - `upload/` - File upload with S3 presigned URLs
- `server/lib/aws/` - AWS service integrations (DynamoDB, S3, Auth)
- `server/services/` - Business logic services
- `server/utils/` - Utility functions and middleware
- `server/types/` - TypeScript types organized by feature
- `server/config/` - Environment configuration
- `server/serverless.yml` - Serverless Framework configuration

## Key Technologies

### External Services
- **FAL.AI**: Used for FLUX LoRA model training and inference
- **AWS Services**: Lambda, DynamoDB, S3, API Gateway

### Development Tools
- **TypeScript**: Strict typing throughout the stack
- **ESLint**: Code linting with consistent configuration
- **Vite**: Fast frontend build tool with React SWC
- **Serverless Framework**: Infrastructure as code for AWS deployment

## Environment Setup

The project requires environment variables for:
- AWS credentials and region
- JWT secret for authentication
- FAL.AI API key for model training
- CORS origin configuration

## Database Schema

The DynamoDB tables use the following structure:
- **user-settings**: User profiles and encrypted API keys
- **training-models**: Model metadata, status, and configuration
- **training-images**: Image metadata with deduplication hashes
- **generated-images**: Generated image records with prompts

## Path Aliases

The project uses consistent path aliases:
- `@/` - src/ directory root
- `@/components` - React components
- `@/lib` - Utilities and libraries
- `@/hooks` - Custom React hooks
- `@/types` - TypeScript definitions
- `@/services` - External service clients