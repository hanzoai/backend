#!/bin/bash
name=hanzo-backend
project_id=hanzo-production
yarn
npx tsc
npm run build
gcloud config set project $project_id
gcloud builds submit --tag gcr.io/$project_id/$name