import fs from 'fs';
import { Parser } from 'json2csv';
import path from 'path';
import Xlsx from 'xlsx';
import Invoice from '../models/Invoice';

interface InvoiceData {
    clientName : string,
    dueDate : string
}

export const exportInvoicesToCsv = async () => {
    try {
        const invoices =await  Invoice.find().lean();
        const json2csv = new Parser();
        const csvData = json2csv.parse(invoices);

        const filePath = path.join(__dirname, '../../temp/invoices.csv');
        console.log(filePath);
        fs.writeFileSync(filePath, csvData);
        console.log('Invoices exported to CSV');
        return filePath;
    } catch (error) {
        console.error('Error exporting invoices to CSV:', error);
        throw new Error('Error exporting invoices')
    }
}

export const exportInvoicesToExcel = async () => {
    try {
        const invoices = await Invoice.find();
        const ws = Xlsx.utils.json_to_sheet(invoices);  
        const wb = Xlsx.utils.book_new();
        Xlsx.utils.book_append_sheet(wb, ws, 'Invoices');

        const filePath = path.join(__dirname, '../../temp/invoices.xlsx');
        Xlsx.writeFile(wb, filePath);
        console.log('Invoices exported to Excel');
        return filePath;
    } catch (error) {
        console.error('Error exporting invoices to CSV:', error);
        throw new Error('Error exporting invoices')
    }
}


export const importInvoicesFromCsv = async (filePath: string) => {
    const results: any[] = [];
    const parser = require('csv-parser')
    fs.createReadStream(filePath)
        .pipe(parser())
        .on('data', (row: any) => results.push(row))
        .on('end', async () => {
            try {
                const invoices = results.map((invoice: any) => ({
                    clientName: invoice.clientName,
                    email: invoice.email,
                    amount: Number(invoice.amount),
                    dueDate: new Date(invoice.dueDate),
                    status: invoice.status,
                    recurrence: invoice.recurrence,
                    nextInvoiceDate: new Date(invoice.nextInvoiceDate),
                }));

                // Validate and save the invoices
                for (const invoice of invoices) {
                    const existingInvoice = await Invoice.findOne({
                        clientName: invoice.clientName,
                        dueDate: invoice.dueDate,
                    });

                    if (!existingInvoice) {
                        await Invoice.create(invoice);
                    }
                }

                console.log('Invoices imported successfully!');
            } catch (error) {
                console.error('Error importing invoices from CSV:', error);
            }
        });
}

export const importInvoicesFromExcel = async(filePath : string) => {
    try {
        const workBook = Xlsx.readFile(filePath);
        const sheetName = workBook.SheetNames[0];
        const sheet = workBook.Sheets[sheetName];
        const invoices = Xlsx.utils.sheet_to_json<InvoiceData>(sheet);

        for(const invoice of invoices){
            const existingInvoice = await Invoice.findOne({
                clientName : invoice.clientName,
                dueDate : new Date(invoice.dueDate)
            });
            if (!existingInvoice) {
                await Invoice.create(invoice);
              }
        
        }
    } catch (error) {
        console.error("Error importing invoices from Excel:", error);
    }
}