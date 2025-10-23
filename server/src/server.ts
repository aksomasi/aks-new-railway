import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import helmet from 'helmet';
import path from 'path';
import { createServer } from 'http';
import corsMiddleware from './middleware/cors';
import routes from './routes';
import { SocketServer } from './websocket/socketServer';
import { setSocketInstance } from './websocket/events';

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3000;

// Initialize WebSocket server
const ws = new SocketServer(httpServer);
setSocketInstance(ws);

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "script-src-attr": ["'unsafe-inline'"]
    }
  }
}));
app.use(corsMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static('uploads'));
app.use(express.static(path.join(__dirname, '../../client/dist')));

// Routes
app.use('/api', routes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Handle Angular routing - serve index.html for all non-API routes
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
    res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
  } else {
    res.status(404).json({ error: 'Route not found' });
  }
});

httpServer.listen(PORT, () => {
  console.log(`🚀 Wienerschnitzel API Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
  console.log(`🔌 WebSocket server ready`);
});

export { ws as socketServer };
export default app;