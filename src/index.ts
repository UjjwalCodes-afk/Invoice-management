import express from 'express';
import { connectDb } from './utils/database';
import invoiceRouter from './Routes/invoiceRoutes';


const app = express();

//middleware
app.use(express.json());
connectDb();


///routes of invoice
app.use('/api',invoiceRouter);

const port = process.env.PORT || 9001

app.listen(port, () => {
    console.log(`Server Running on PORT  ${port}`);
})