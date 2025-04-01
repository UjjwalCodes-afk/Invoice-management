import { Request, Response, NextFunction } from "express";

import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET as string;

export const authentiCate = async(req : Request, res : Response, next : NextFunction) => {
    const token = req.header('Authorization')?.split(' ')[1];
        if(!token){
            res.status(404).json({message : 'No token found'});
            return;
        }
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as {userId : string, role : string};
        req.body.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
        return;
    }
}

export const authorize = (roles : string[]) => {
    return(req : Request, res : Response, next : NextFunction) => {
        if(!roles.includes(req.body.user.role)){
            res.status(403).json({ message: 'Access denied' });
            return;
        }
        next();
    }
}
