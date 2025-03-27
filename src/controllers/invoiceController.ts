import { Request, Response } from "express";
import Invoice from "../models/Invoice";
import Joi from "joi";
const InvoiceValidation = Joi.object({
    clientName: Joi.string().required(),
    amount: Joi.number().required(),
    dueDate: Joi.date().required(),
})
export const createInvoice = async (req: Request, res: Response) => {
    try {
        const { error } = req.body;
        if (error) {
            res.status(400).json({ message: error.details[0].message });
        }
        const { clientName, amount, dueDate } = req.body;
        if (!clientName || !amount || !dueDate) {
            res.status(400).json({ message: 'all fields are required' });
        }
        const newInvoice = new Invoice({ clientName, amount, dueDate });
        newInvoice.save();
        res.status(201).json(newInvoice);
    } catch (error) {
        console.log(error);
    }
}

export const getInvoices = async (req: Request, res: Response) => {
    try {
        const invoices = await Invoice.find();
        res.status(200).json(invoices);
    } catch (error) {
        console.log(error);
    }
}

export const updateInvoiceStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        if (!['pending', 'paid', 'overdue'].includes(status)) {
            res.status(400).json({ message: 'Invalid status' });
            return;
        }
        const updatedInvoice = await Invoice.findByIdAndUpdate(id, { status }, { new: true });
        if (!updateInvoiceStatus) {
            res.status(401).json({ message: 'Invoice not found' });
            return;
        }
        res.status(200).json(updatedInvoice);
    } catch (error) {
        console.log(error);
    }
}

export const deleteInvoice = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const deletedInvoice = await Invoice.findByIdAndDelete(id);
        if (!deleteInvoice) {
            res.status(400).json({ message: 'Invoice not found' });
        }
        res.status(200).json({message : 'Invoice has been deleted'});
    } catch (error) {
        console.log(error);
    }
}

//aggregation 
export const getMonthlyReports = async(req : Request,res : Response) => {
    try {
        const report = await Invoice.aggregate([
            {
                $group : {
                    _id : {$month : '$createdAt'},
                    totalAmount : {$sum : '$amount'},
                    totalInvoices : {$sum : 1},
                    paidInvoices : {
                        $sum : {$cond : [{$eq : ['$status', 'paid']},1,0]}
                    }
                }
            }
        ]);
        res.status(200).json(report);
    } catch (error) {
        console.log(error);
    }
}