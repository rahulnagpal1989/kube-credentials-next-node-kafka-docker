import express from 'express';
import bodyParser from 'body-parser';
import routes from './routes';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use('/api', routes);
app.get('/health', (_req: any, res: any) => res.json({ status: 'ok' }));

export default app;
