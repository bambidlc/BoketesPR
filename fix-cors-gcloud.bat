@echo off
echo Setting up CORS for Firebase Storage...

REM Download and install Google Cloud SDK if not already installed
REM You may need to download from: https://cloud.google.com/sdk/docs/install

REM Authenticate with Google Cloud
gcloud auth login

REM Set the project
gcloud config set project pothole-app-3ee2a

REM Apply CORS configuration
gsutil cors set cors.json gs://pothole-app-3ee2a.firebasestorage.app

echo CORS configuration applied successfully!
echo.
echo If this doesn't work, you can also set CORS manually in Google Cloud Console:
echo 1. Go to https://console.cloud.google.com/storage/browser
echo 2. Select your bucket: pothole-app-3ee2a.firebasestorage.app
echo 3. Go to Configuration tab
echo 4. Add the CORS configuration from cors.json

pause
