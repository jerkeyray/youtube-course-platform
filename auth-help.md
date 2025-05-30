// This is a helper file to test the auth configuration with Auth.js
// It provides instructions on ensuring your Google OAuth credentials are set up correctly
// You'll need to set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your .env file

// Instructions for creating Google OAuth credentials:
// 1. Go to Google Cloud Console (https://console.cloud.google.com/)
// 2. Create a new project or select an existing one
// 3. Go to "APIs & Services" > "Credentials"
// 4. Click on "Create Credentials" > "OAuth client ID"
// 5. Select "Web application" as the application type
// 6. Add the following authorized redirect URIs:
// - http://localhost:3000/api/auth/callback/google (for development)
// - https://your-production-domain.com/api/auth/callback/google (for production)
// 7. Copy the Client ID and Client Secret to your .env file

// Example .env file:
// GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
// GOOGLE_CLIENT_SECRET=your-client-secret
// DATABASE_URL=your-database-connection-string
// DIRECT_URL=your-direct-database-connection-string
// NEXTAUTH_SECRET=your-random-secret-for-jwt-encryption
// NEXTAUTH_URL=http://localhost:3000 (for development)
