import mongoose, {Schema, Document} from "mongoose";

interface Iuser extends Document {
    name : string;
    email: string;
    password: string;
    role: 'user' | 'admin';
}

const userSchema = new Schema<Iuser>({
    name : {type : String, required : true},
    email : {type : String, required : true, unique : true},
    password : {type : String, required : true},
    role : {type : String, enum : ['admin','user'], default : 'user'},
}, {timestamps : true})

export const User = mongoose.model<Iuser>("users", userSchema);