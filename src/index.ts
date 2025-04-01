import express from 'express';
import { connectDb } from './utils/database';
import invoiceRouter from './Routes/invoiceRoutes';
import { handleStripeWebhook } from './controllers/invoiceController';
import authRoute from './Routes/authRoutes';
import protectedRoute from './Routes/protectecRoutes';
import csv from './Routes/csv-excel';

const app = express();

app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);
// ✅ Use express.json() for normal routes
app.use(express.json());
connectDb();

// ✅ Register other routes
app.use('/api', invoiceRouter);


//auth Routes
app.use('/api/auth', authRoute);

//role based accessthrhrh
app.use('/api',protectedRoute);

//csv-excels
app.use('/data', csv);

// ✅ Use express.raw() for the webhook route

const port = process.env.PORT || 9090;

app.listen(port, () => {
  console.log(`Server Running on PORT ${port}`);
});
