
import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import { coreController } from './controllers/core.controller';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware: JSON Parsing
app.use(express.json());

// Middleware: Global Request Logger
app.use((req: Request, res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url} - ${req.ip}`);
  next();
});

// Health Check Endpoint
app.get('/status', coreController.status);

// Core MOS API Routes
app.get('/trips', coreController.listTrips);
app.post('/trips', coreController.createTrip);

app.get('/saccos', coreController.listSaccos);

app.get('/operators', coreController.listOperators);
app.post('/operators', coreController.createOperator);

// Catch-all 404
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Endpoint not found in MOS Core" });
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('UNEXPECTED_CORE_ERROR:', err);
  res.status(500).json({
    success: false,
    error: "Internal Server Error in Lync MOS Core",
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`
  🚀 Lync MOS Core Active
  🌐 Port: ${PORT}
  🛠️  Mode: ${process.env.NODE_ENV || 'production'}
  📡 Health Check: http://localhost:${PORT}/status
  `);
});

export default app;
