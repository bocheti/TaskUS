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
app.use(cors());
//app.use(cors({origin: ['https://taskus.app', 'https://angular.taskus.app', 'https://react.taskus.app']})); TODO: limit requests just from frontend, do during deployment
app.use(helmet()); // secure http headers
app.use(express.json({ limit: '10kb' })); // prevents ddos attacks

if (process.env.NODE_ENV !== 'test') {
  const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    message: { error: 'Too many requests, please try again later' }
  });

  const sensitiveLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { error: 'Too many requests, please try again later' }
  });

  app.use(generalLimiter);
  app.use('/user/login', sensitiveLimiter);
  app.use('/user/passwordRequest', sensitiveLimiter);
  app.use('/organisation', sensitiveLimiter);
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