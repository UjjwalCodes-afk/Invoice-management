import express from 'express';
import { createInvoice, deleteInvoice, getInvoices, getMonthlyReports, updateInvoiceStatus } from '../controllers/invoiceController';
import { downloadInvoice } from '../utils/InvoiceDownloader';
import { sendInvoiceEmail } from '../mail/emailSend';


const invoiceRouter = express.Router();

invoiceRouter.post('/create', createInvoice);

invoiceRouter.get('/get', getInvoices );

invoiceRouter.patch('/update/:id', updateInvoiceStatus);

invoiceRouter.delete('/delete/:id', deleteInvoice);

//download Invoice
invoiceRouter.get('/download/:id', downloadInvoice);

//send mail 
invoiceRouter.post('/send-email', sendInvoiceEmail);


//get monthly reports
invoiceRouter.get('/report',getMonthlyReports);

export default invoiceRouter;