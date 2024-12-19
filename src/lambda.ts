import serverless from 'serverless-http';
import app from './app';  // Your existing Express app

// Export the handler function for AWS Lambda
export const handler = serverless(app);