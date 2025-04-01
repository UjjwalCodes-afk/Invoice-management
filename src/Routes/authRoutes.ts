import express from 'express';
import { Login, signUp } from '../controllers/authController';


const authRoute = express.Router();

//signup
authRoute.post('/signup', signUp);

//login

authRoute.post('/login', Login);

export default authRoute;