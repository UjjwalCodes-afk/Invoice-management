import express from 'express';
import multer from 'multer';
import { exportInvoicesCsv, exportInvoicesExcel, importInvoicesCsv, importInvoicesExcel } from '../controllers/csv-excel';

const csv = express.Router();

const uplaod = multer({dest : 'uploads/'})

//export 

csv.get('/export/csv', exportInvoicesCsv);

csv.get('/export/excel', exportInvoicesExcel);

//import

csv.post('/import/csv', uplaod.single('file'),importInvoicesCsv);

csv.post('/import/excel',uplaod.single('file'), importInvoicesExcel);

export default csv;

