import PDFDocument from 'pdfkit'; // Import PDFDocument correctly
import nodemailer from 'nodemailer';
import { Request, Response } from 'express';
import Invoice from '../models/Invoice';
import fs from 'fs';
import path from 'path';

export const sendInvoiceEmail = async (req: Request, res: Response) => {
  try {
    const { id, email } = req.body;

    // Find the invoice by ID
    const invoice = await Invoice.findById(id);
    if (!invoice) {
       res.status(404).json({ message: "Invoice not found" });
       return;
    }

    // Create a new PDF document
    const doc = new PDFDocument();
    const filePath = path.join(__dirname, `../temp/Invoice_${invoice._id}.pdf`);  // Save file to a temp directory
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

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

    stream.on("finish", async () => {
      try {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
          tls: {
            rejectUnauthorized: false,
          },
        });

        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: email,
          subject: "Invoice",
          text: "Here is your invoice",
          attachments: [
            {
              filename: `Invoice_${invoice._id}.pdf`,
              path: filePath,
            },
          ],
        });

        // Delete the temporary file after sending email
        fs.unlinkSync(filePath);  // Clean up the generated PDF file

        res.status(200).json({ message: "Invoice sent successfully" });
      } catch (error) {
        console.error("❌ Error sending email:", error);
        res.status(500).json({ message: "Failed to send email" });
      }
    });
  } catch (error) {
    console.error("❌ Error generating invoice:", error);
    res.status(500).json({ message: "Failed to generate invoice" });
  }
};
