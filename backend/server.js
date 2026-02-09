import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
// CORS ayarları en üste alınmalı
const allowedOrigins = [
  'https://task-management-frontend-6khn.onrender.com',
  'http://localhost:5173'
];
app.use(cors({
  origin: function(origin, callback) {
    console.log('CORS Origin:', origin);
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS: ' + origin));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Preflight (OPTIONS) isteklerine global cevap
app.options('*', cors());
import { connectDB } from './config/db.js';

import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import taskRoutes from './routes/tasks.js';
import statsRoutes from './routes/stats.js';
import constantsRoutes from './routes/constants.js';

dotenv.config();

const app = express();

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