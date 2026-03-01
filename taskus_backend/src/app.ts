import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './routes/user.routes';
import organisationRoutes from './routes/organisation.routes';
import projectRoutes from './routes/project.routes';
import taskGroupRoutes from './routes/taskGroup.routes';
import taskRoutes from './routes/task.routes';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/user', userRoutes);
app.use('/organisation', organisationRoutes);
app.use('/project', projectRoutes);
app.use('/taskGroup', taskGroupRoutes);
app.use('/task', taskRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

export default app;