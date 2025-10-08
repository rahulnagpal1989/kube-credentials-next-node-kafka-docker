
import express from 'express';
import bodyParser from 'body-parser';
import routes from './routes';
import cors from 'cors';

const app = express();

var whitelist = ['http://localhost:3000'];
var corsOptions = {
  origin: function (origin: any, callback: any) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use('/api', routes);
app.get('/health', (_req:any, res:any) => res.json({ status: 'ok' }));

export default app;
