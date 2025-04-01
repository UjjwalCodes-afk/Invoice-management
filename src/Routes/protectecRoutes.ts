import express from 'express';
import { authentiCate, authorize } from '../middlewares/authMiddleware';


const protectedRoute = express.Router();


protectedRoute.post('/profile', authentiCate, (req, res) => {
    res.json({message : 'Welcome to user profile'})
})

protectedRoute.post('/admin', authentiCate, authorize(['admin']), (req, res) => {
    res.json({message : 'Welcome admin'})
} )

export default protectedRoute;