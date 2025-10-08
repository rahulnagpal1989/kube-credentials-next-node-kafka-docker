import dotenv from 'dotenv';
dotenv.config();
import app from './app';

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001;
app.listen(PORT, () => console.log(`Issuance service listening on port ${PORT}`));
