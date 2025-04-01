import express from 'express';
import { createCheckoutSession, createInvoice, createPayment, deleteInvoice, getInvoices, getMonthlyReports, handleStripeWebhook, updateInvoiceStatus } from '../controllers/invoiceController';
import { downloadInvoice } from '../utils/InvoiceDownloader';
import { sendInvoiceEmail } from '../mail/emailSend';
import { authentiCate, authorize } from '../middlewares/authMiddleware';


const invoiceRouter = express.Router();

invoiceRouter.post('/create',authentiCate ,authorize(['admin']),createInvoice);

invoiceRouter.get('/get',authentiCate, getInvoices );

invoiceRouter.patch('/update/:id',authentiCate ,authorize(['admin']), updateInvoiceStatus);

invoiceRouter.delete('/delete/:id',authentiCate ,authorize(['admin']), deleteInvoice);

//download Invoice
invoiceRouter.get('/download/:id',authentiCate, downloadInvoice);

//send mail 
invoiceRouter.post('/send-email',authentiCate, sendInvoiceEmail);


//get monthly reports
invoiceRouter.get('/report',authentiCate,getMonthlyReports);

//create payment intent
invoiceRouter.post('/create-payment-intent',authentiCate,createPayment);

//checkout session
invoiceRouter.post('/create-session',authentiCate,createCheckoutSession);




export default invoiceRouter;