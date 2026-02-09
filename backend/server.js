import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';

import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import taskRoutes from './routes/tasks.js';
import statsRoutes from './routes/stats.js';
import constantsRoutes from './routes/constants.js';

dotenv.config();

const app = express();

// İzin verilen frontend origin'leri (env'den; virgülle ayırarak birden fazla eklenebilir)
const allowedOrigins = (process.env.ALLOWED_ORIGINS || process.env.FRONTEND_URL || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

// Origin yoksa veya whitelist boşsa: gelen origin'i kabul et (geliştirme için)
function corsOrigin(origin, cb) {
  if (!origin) return cb(null, true); // same-origin veya Postman vb.
  if (allowedOrigins.length === 0) return cb(null, true); // whitelist yoksa tüm origin'lere izin
  if (allowedOrigins.includes(origin)) return cb(null, true);
  return cb(null, false);
}

app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'HEAD'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization', 'Cookie', 'Set-Cookie'],
    exposedHeaders: ['Set-Cookie'],
    maxAge: 86400,
  })
);

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