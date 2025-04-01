import { Request, Response } from "express";
import Invoice from "../models/Invoice";
import Joi from "joi";
import { stripe } from "../config/stripe";
import Stripe from "stripe";
import mongoose from "mongoose";
import { sendPaymentConfirmationEmail } from "../mail/paymentConfirm";
import { sendInvoiceEmail } from "../mail/emailSend";



const STRIPE_WEBHOOK = process.env.STRIPE_WEBHOOK_SECRET as string;
export const createInvoice = async (req: Request, res: Response) => {
    try {
        const { clientName, clientEmail, amount, dueDate, paymentMethod, recurrence } = req.body;

        // Basic Validation
        if (!clientName || !clientEmail || !amount || !dueDate) {
             res.status(400).json({ message: "All required fields must be provided." });
             return;
        }

        // Validate Recurrence
        const validRecurrence = ["none", "monthly", "quarterly", "yearly"];
        if (recurrence && !validRecurrence.includes(recurrence)) {
             res.status(400).json({ message: "Invalid recurrence value." });
             return;
        }

        // Create New Invoice
        const newInvoice = new Invoice({
            clientName,
            clientEmail,
            amount,
            dueDate,
            status: "pending",
            paymentMethod,
            recurrence: recurrence || "none",
            lastGenerated: new Date(),
        });

        await newInvoice.save();
        res.status(201).json({ message: "Invoice created successfully", invoice: newInvoice });
    } catch (error) {
        console.error("❌ Error creating invoice:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

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

//payment controller
export const createPayment = async(req :Request, res: Response) => {
    try { 
        const{amount,currency = 'usd', invoiceId} = req.body;
        if(!amount || !invoiceId){
            res.status(400).json({message : 'Required amount and invoiceId'});
        }
        const payment = await stripe.paymentIntents.create({
            amount : amount * 100,
            currency,
            metadata : {invoiceId, status : invoiceId.status}
        })
        res.status(200).json({
            clientSecret : payment.client_secret,
            paymentIntentId : payment.id
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Failed to create payment intent' });
    }
}

export const handleStripeWebhook = async (req: Request, res: Response) => {
    const sig = req.headers['stripe-signature'];
  
    if (!sig) {
      console.error('❌ Missing stripe-signature header');
       res.status(400).send('Missing stripe-signature header');
       return;
    }
  
    try {
      // ✅ Use raw request body directly as Buffer
      const event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET as string
      );
  
      console.log('✅ Event type:', event.type);
  
      if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`✅ PaymentIntent successful: ${paymentIntent.id}`);
  
        const invoiceId = paymentIntent.metadata.invoiceId;
  
        if (invoiceId) {
          // ✅ Convert invoiceId to ObjectId before updating
          const objectId = new mongoose.Types.ObjectId(invoiceId);
  
          const updatedInvoice = await Invoice.findByIdAndUpdate(
            objectId,
            { status: 'paid' },
            { new: true } // Return the updated document
          );
  
          if (updatedInvoice) {
            console.log(`✅ Invoice ${invoiceId} marked as paid`);
          } else {
            console.error(`❌ Invoice ${invoiceId} not found`);
          }
        } else {
          console.error('❌ Missing invoiceId in metadata');
        }
      } else if (event.type === 'payment_intent.payment_failed') {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.error(`❌ Payment failed: ${paymentIntent.id}`);
  
        const invoiceId = paymentIntent.metadata.invoiceId;
  
        if (invoiceId) {
          const objectId = new mongoose.Types.ObjectId(invoiceId);
  
          const updatedInvoice = await Invoice.findByIdAndUpdate(
            objectId,
            { status: 'failed' },
            { new: true }
          );
  
          if (updatedInvoice) {
            console.log(`✅ Invoice ${invoiceId} marked as failed`);
          } else {
            console.error(`❌ Invoice ${invoiceId} not found`);
          }
          
        }
      }
      else if(event.type === 'checkout.session.completed'){
        const session = event.data.object as Stripe.Checkout.Session;
        console.log(`✅ Checkout Session completed: ${session.id}`);
        console.log("🔹 Full Session Data:", session); // Log entire session object
        console.log("🔹 Session Metadata:", session.metadata); // Log metadata
        const invoiceId = session.metadata?.invoiceId;
        const clientName = session.customer_email;
        if(invoiceId){
            if (!mongoose.Types.ObjectId.isValid(invoiceId)) {
                console.error(`❌ Invalid invoiceId format: ${invoiceId}`);
                 res.status(400).send(`Invalid invoiceId format: ${invoiceId}`);
                 return;
            }
            
            const objectId = new mongoose.Types.ObjectId(invoiceId);
            

            const updatedInvoice = await Invoice.findByIdAndUpdate(objectId, {status : 'paid'}, {new : true});
            if (updatedInvoice) {
                console.log(`✅ Invoice ${invoiceId} marked as paid`);
                if (clientName) {
                    await sendPaymentConfirmationEmail(clientName,String(updatedInvoice._id).toString(), updatedInvoice.amount);
                }
                
            } else {
                console.error(`❌ Invoice ${invoiceId} not found`);
            }
        }
      }
  
      res.status(200).json({ received: true });
    } catch (err: any) {
      console.error(`❌ Webhook error: ${err.message}`);
      res.status(400).send(`Webhook Error: ${err.message}`);
    }
};

export const createCheckoutSession = async (req: Request, res: Response) => {
    try {
        const { invoiceId,customer_email } = req.body;

        if (!invoiceId || !customer_email) {
             res.status(400).json({ message: "Invoice ID And Email is required" });
             return;
        }

        // Fetch invoice details
        const invoice = await Invoice.findById(invoiceId);
        if (!invoice) {
             res.status(404).json({ message: "Invoice not found" });
             return;
        }

        // Create a Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment",
            success_url: `http://localhost:9090/success`,
            cancel_url: `http://localhost:9090/cancel`,
            customer_email : customer_email,
            metadata: { invoiceId: invoiceId.toString() }, // Send invoice ID as metadata
            line_items: [
                {
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: `Invoice #${invoice._id}`,
                            description: `Payment for ${invoice.clientName}`,
                        },
                        unit_amount: invoice.amount * 100, // Convert to cents
                    },
                    quantity: 1,
                },
            ],
        });

        res.status(200).json({ url: session.url });
    } catch (error) {
        console.error("❌ Error creating checkout session:", error);
        res.status(500).json({ message: "Failed to create checkout session" });
    }
};


