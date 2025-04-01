import mongoose, {Schema, Document} from "mongoose";

interface Iinvoice extends Document{
    clientName : string,
    clientEmail : string
    amount : number,
    status : string,
    dueDate : Date,
    paymentMethod? : string,
    recurrence : "none" | "monthly" | "quarterly" | "yearly";
    transactionId? : string,
    lastGenerated? : Date
}

const invoiceSchema = new Schema<Iinvoice> ({
    clientName : {type : String , required : true},
    clientEmail : {type : String , required : true},
    amount : {type : Number, required : true},
    status : {type : String,enum : ['pending', 'paid', 'failed'] ,required : true, default : 'pending'},
    dueDate : {type : Date, required : true},
    paymentMethod : {type : String},
    recurrence : {type : String, enum : ['none','monthly','quaterly','yearly'], default : 'none'},
    lastGenerated : {type : Date,  default : 'none'},
    transactionId : {type : String}
}, {
    timestamps : true
});

const Invoice = mongoose.model<Iinvoice>("invoices",invoiceSchema);

export default Invoice;