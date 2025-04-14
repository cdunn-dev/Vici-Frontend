import * as express from 'express';
import * as cors from 'cors';
import helmet from 'helmet';
import * as compression from 'compression';
import * as morgan from 'morgan';
import * as bodyParser from 'body-parser';
import 'dotenv'; // Just import for side effects (preloading)

// Load environment variables FIRST
// dotenv.config(); // REMOVE this line as it's handled by -r dotenv/config in the script

// Import routes (ensure this uses the correct path after compilation)
// If setupRoutes needs env vars, ensure it's called after dotenv.config()
import router from './routes'; // Assuming routes/index.ts exports the main router directly

// Create Express app
const app = express();
const port = process.env.PORT || 3001;

// Apply middleware
app.use(cors());
app.use(helmet());
app.use(compression());
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Setup API routes
// Ensure any middleware needing req.user (like authenticateJwt) is applied correctly within the routes
app.use('/api', router); // Mount the main router under /api

// Basic check if routes are loaded (for debugging)
app.use('/api/ping', (req, res) => res.send('pong from base API'));

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global Error Handler:', err);
  // Ensure JWT_SECRET load check
  if (!process.env.JWT_SECRET) {
    console.error('FATAL: JWT_SECRET environment variable is not set.');
    // Optionally, you might want to exit or prevent startup if critical secrets are missing
  }
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' && !err.status 
      ? 'An unexpected server error occurred.' 
      : err.message || 'Internal Server Error',
    // Optionally include stack trace in development
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

// Start server
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`API server running on port ${port}`);
    if (!process.env.JWT_SECRET) {
        console.error('Warning: JWT_SECRET is not set. Authentication will fail.');
    }
    if (!process.env.GOOGLE_GEMINI_API_KEY) {
        console.error('Warning: GOOGLE_GEMINI_API_KEY is not set. LLM features will fail.');
    }
    if (!process.env.DATABASE_URL) {
        console.error('Warning: DATABASE_URL is not set. Database operations will fail.');
    }
  });
}

export default app; 