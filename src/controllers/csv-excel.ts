import { Request, Response } from "express"
import { exportInvoicesToCsv, exportInvoicesToExcel, importInvoicesFromCsv, importInvoicesFromExcel } from "../utils/fileUtils"
export const exportInvoicesCsv = async(req : Request, res : Response) => {
    try {
        const filePath = await exportInvoicesToCsv();
        res.download(filePath, 'invoices.csv', (err) => {
            if(err){
                console.error('Error sending CSV file:', err);
                res.status(500).send('Error exporting invoices');
            }
        })
    } catch (error) {
        console.error('Error exporting invoices:', error);
        res.status(500).send('Error exporting invoices');
    }
}

export const exportInvoicesExcel = async(req : Request, res : Response) => {
    try {
        const filePath = await exportInvoicesToExcel();
        res.download(filePath, 'invoices.xlsx', (err) => {
            if (err) {
                console.error('Error sending Excel file:', err);
                res.status(500).send('Error exporting invoices');
            }
        })
    } catch (error) {
        console.error('Error exporting invoices:', error);
        res.status(500).send('Error exporting invoices');
    }
}

export const importInvoicesCsv = async(req : Request, res : Response) => {
    try {
        const file = req.file;
        if(!file){
            res.status(400).json({message : 'no file uploaded'});
            return;
        }
        await importInvoicesFromCsv(file.path);
        res.status(200).send('Invoices imported successfully');
    } catch (error) {
        console.error('Error importing invoices:', error);
        res.status(500).send('Error importing invoices');
    }
}

export const importInvoicesExcel = async(req :Request, res : Response) => {
    try {
        const file = req.file;
        if(!file){
            res.status(400).json({message : 'no file uploaded'});
            return;
        }
        await importInvoicesFromExcel(file?.path);       
    } catch (error) {
        console.error('Error importing invoices:', error);
        res.status(500).send('Error importing invoices');
    }
}