import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';

import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import taskRoutes from './routes/tasks.js';
import statsRoutes from './routes/stats.js';
import constantsRoutes from './routes/constants.js';

dotenv.config();

const app = express();

// Request logger - TÜM istekleri logla
app.use((req, res, next) => {
  console.log('========== INCOMING REQUEST ==========');
  console.log('Time:', new Date().toISOString());
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Origin:', req.headers.origin);
  console.log('Host:', req.headers.host);
  console.log('=======================================');
  next();
});

// AGRESIF CORS - HER ORIGIN'E İZİN VER
app.use((req, res, next) => {
  const origin = req.headers.origin;
  console.log('CORS: Setting headers for origin:', origin);
  
  // Her origin'e izin ver
  res.setHeader('Access-Control-Allow-Origin', origin || '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cookie, Set-Cookie');
  res.setHeader('Access-Control-Expose-Headers', 'Set-Cookie');
  res.setHeader('Access-Control-Max-Age', '86400');
  
  // OPTIONS (preflight) isteklerine hemen cevap ver
  if (req.method === 'OPTIONS') {
    console.log('CORS: Responding to OPTIONS preflight with 204');
    return res.status(204).end();
  }
  next();
});

app.use(cookieParser());
app.use(express.json());

// Ana dizin için basit bir yanıt ekle
app.get('/', (req, res) => {
  res.send('API is running');
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/constants', constantsRoutes);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server ${PORT} RUNNING PORT`);
  });
};

startServer();