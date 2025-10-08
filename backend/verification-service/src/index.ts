
import app from './app';
import { startConsumer } from './kafka-consumer';

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3002;
app.listen(PORT, async () => {
    console.log(`Verification service listening on port ${PORT}`);
    await startConsumer();
});
