#!/bin/bash

# Configuration
PROJECT_ID="cloud-homework-3-479217"
REGION="us-central1"
BACKEND_SERVICE="deskhub-backend"
FRONTEND_SERVICE="deskhub-frontend"

echo "Using Project ID: $PROJECT_ID"
gcloud config set project $PROJECT_ID

# Enable services
echo "Enabling necessary services..."
gcloud services enable cloudbuild.googleapis.com run.googleapis.com containerregistry.googleapis.com

# 1. Deploy Backend
echo "Deploying Backend..."
cd backend
gcloud builds submit --tag gcr.io/$PROJECT_ID/$BACKEND_SERVICE

# Note: You need to set DATABASE_URL for the backend to work correctly.
# Only creating the service here. You might need to update it with env vars later if you haven't set them.
gcloud run deploy $BACKEND_SERVICE \
  --image gcr.io/$PROJECT_ID/$BACKEND_SERVICE \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --port 8080 \
  --set-env-vars "DATABASE_URL=postgresql://neondb_owner:npg_BOJ4zpbDR5fK@ep-autumn-brook-aevkrqxc-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

# Get Backend URL
BACKEND_URL=$(gcloud run services describe $BACKEND_SERVICE --platform managed --region $REGION --format 'value(status.url)')
echo "Backend deployed at: $BACKEND_URL"

cd ..

# 2. Deploy Frontend
echo "Deploying Frontend..."
cd frontend
gcloud builds submit --config cloudbuild.yaml --substitutions=_VITE_API_URL="$BACKEND_URL"

gcloud run deploy $FRONTEND_SERVICE \
  --image gcr.io/$PROJECT_ID/$FRONTEND_SERVICE \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --port 8080 \
  --set-env-vars VITE_API_URL=$BACKEND_URL

# Get Frontend URL
FRONTEND_URL=$(gcloud run services describe $FRONTEND_SERVICE --platform managed --region $REGION --format 'value(status.url)')
echo "Frontend deployed at: $FRONTEND_URL"

echo "Deployment Complete!"
echo "Frontend: $FRONTEND_URL"
echo "Backend: $BACKEND_URL"
echo "IMPORTANT: Ensure your Backend has the correct DATABASE_URL environment variable set in Cloud Run console."
