import mongoose, {Schema, Document} from "mongoose";

interface Iinvoice extends Document{
    clientName : string,
    amount : number,
    status : string,
    dueDate : Date
}

const invoiceSchema = new Schema<Iinvoice> ({
    clientName : {type : String , required : true},
    amount : {type : Number, required : true},
    status : {type : String, required : true, default : 'pending'},
    dueDate : {type : Date, required : true},
}, {
    timestamps : true
});

const Invoice = mongoose.model<Iinvoice>("invoices",invoiceSchema);

export default Invoice;