import jwt from 'jsonwebtoken';
import { Request, Response } from "express"
import argon from 'argon2';
import { User } from "../models/userModel";

const JWT_SECRET = process.env.JWT_SECRET as string;

export const signUp = async (req : Request, res : Response) => {
    try {
        const{name,email,password,role} = req.body;
        if(!name || !email || !password ){
            res.status(400).json({message : 'All field are required'});
            return;
        }
        const userFind = await User.findOne({email});
        const hashedPassword = await argon.hash(password);
        if(userFind){
            res.status(400).json({message : 'user already exists'});
            return;
        }
        const newUser = new User({
            name,
            email,
            password : hashedPassword,
            role
        });
        await newUser.save();
        res.status(200).json({message : 'User has been created successfully'});
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error signing up', error });
    }
}
export const Login = async(req : Request, res : Response) => {
    try {
        const{email,password} = req.body;
        if(!email || !password){
            res.status(400).json({message : 'All fields are required'});
            return;
        }
        const userFind = await User.findOne({email});
        if (!userFind){
            res.status(400).json({ message: 'User not found' });
            return;
        }

        //generate a jwt token
        const token = jwt.sign({userId : userFind._id, role : userFind.role}, JWT_SECRET, {expiresIn : '7d'}); 
        res.status(200).json({token, user : {id : userFind._id, role : userFind.role}});
    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error });
    }
}