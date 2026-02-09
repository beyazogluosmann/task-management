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

// Manuel CORS middleware - EN ÜST SIRAYA
app.use((req, res, next) => {
  const origin = req.headers.origin;
  console.log('CORS: Setting headers for origin:', origin);
  res.header('Access-Control-Allow-Origin', origin || '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Preflight isteklerine direkt cevap ver
  if (req.method === 'OPTIONS') {
    console.log('CORS: Responding to OPTIONS preflight');
    return res.sendStatus(200);
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