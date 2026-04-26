import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import userRoutes from './routes/user.routes';
import organisationRoutes from './routes/organisation.routes';
import projectRoutes from './routes/project.routes';
import taskGroupRoutes from './routes/taskGroup.routes';
import taskRoutes from './routes/task.routes';

dotenv.config();

const app = express();
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? ['https://taskus.app', 'https://www.taskus.app', 'https://angular.taskus.app']
  : ['http://localhost:5173', 'http://localhost:4200']; 

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (postman or own backend)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
}));
app.use(helmet());
app.use(express.json({ limit: '10kb' }));

if (process.env.NODE_ENV !== 'test') {
  const maxRequests = process.env.RATE_LIMIT_MAX ? parseInt(process.env.RATE_LIMIT_MAX) : 500;
  const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: maxRequests,
    message: { error: 'Too many requests, please try again later' }
  });
  app.use(generalLimiter);
}

app.use('/user', userRoutes);
app.use('/organisation', organisationRoutes);
app.use('/project', projectRoutes);
app.use('/taskGroup', taskGroupRoutes);
app.use('/task', taskRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

export default app;