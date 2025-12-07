// Script to fix CORS issues - run this with Node.js
const { Storage } = require('@google-cloud/storage');

async function fixCors() {
  const storage = new Storage({
    projectId: 'pothole-app-3ee2a'
  });

  const bucketName = 'pothole-app-3ee2a.firebasestorage.app';
  const bucket = storage.bucket(bucketName);

  const corsConfiguration = [{
    origin: ['http://localhost:5173', 'https://pothole-app-3ee2a.web.app', 'https://pothole-app-3ee2a.firebaseapp.com'],
    method: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    maxAgeSeconds: 3600,
    responseHeader: ['Content-Type', 'Authorization', 'Content-Length', 'Accept-Encoding', 'X-CSRF-Token']
  }];

  try {
    await bucket.setCorsConfiguration(corsConfiguration);
    console.log('CORS configuration updated successfully!');
  } catch (error) {
    console.error('Error updating CORS:', error);
  }
}

fixCors();
