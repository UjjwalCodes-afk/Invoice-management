import PDFDocument from 'pdfkit';
import { Request, Response } from 'express';
import Invoice from '../models/Invoice';

export const downloadInvoice = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const invoice = await Invoice.findById(id);

        if (!invoice) {
            res.status(404).json({ message: 'Invoice not found' });
            return;
        }

        const doc = new PDFDocument({ margin: 50 });

        const fileName = `Invoice_${invoice._id}.pdf`;
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            `attachment; filename=${fileName}`
        );

        doc.pipe(res);

        // ✅ Header section
        doc
            .fontSize(24)
            .text('INVOICE', { align: 'center', underline: true })
            .moveDown();

        // ✅ Company Info
        doc
            .fontSize(12)
            .text('Company Name: XYZ Pvt Ltd.', { align: 'left' })
            .text('Address: 123 Business Road, Suite 456', { align: 'left' })
            .text('Email: contact@xyz.com', { align: 'left' })
            .text('Phone: +1 123-456-7890', { align: 'left' })
            .moveDown();

        // ✅ Client Info
        doc
            .fontSize(14)
            .fillColor('#333333')
            .text(`Client Name: ${invoice.clientName}`)
            .moveDown();

        // ✅ Invoice Details Table
        doc
            .fontSize(14)
            .fillColor('#000000')
            .text('Invoice Details:', { underline: true })
            .moveDown();

        const tableTop = doc.y;
        const itemSpacing = 25;

        doc
            .fontSize(12)
            .text('Amount:', 50, tableTop)
            .text(`$${invoice.amount}`, 200, tableTop);

        doc
            .text('Due Date:', 50, tableTop + itemSpacing)
            .text(`${invoice.dueDate.toDateString()}`, 200, tableTop + itemSpacing);

        doc
            .text('Status:', 50, tableTop + itemSpacing * 2)
            .text(`${invoice.status}`, 200, tableTop + itemSpacing * 2);

        // ✅ Footer Section
        doc
            .fontSize(10)
            .fillColor('#888888')
            .text('Thank you for your business!', 50, doc.page.height - 100, {
                align: 'center'
            });

        doc
            .fillColor('#888888')
            .text('For any questions, please contact us at support@xyz.com', 50, doc.page.height - 80, {
                align: 'center'
            });

        doc.end();

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
