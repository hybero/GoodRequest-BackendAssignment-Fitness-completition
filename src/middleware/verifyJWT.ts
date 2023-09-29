import { Request, Response, NextFunction } from 'express'
import 'dotenv/config'
import jwt from 'jsonwebtoken'

export interface UpdatedRequest extends Request {
    UserInfo: {
        id?: string;
        name?: string;
        surname?: string;
        email?: string;
        age?: number;
        role?: string;
    };
}

export const verifyJWT = (req: UpdatedRequest, res: Response, next: NextFunction) => {
    
    const authHeader = req.headers.authorization || req.headers.Authorization

    if(typeof authHeader === 'undefined') return res.status(400).json({ 'message': 'Authorization failed.' })
    
    if (typeof authHeader === 'string') {
        
        if(!authHeader?.startsWith('Bearer ')) return res.sendStatus(401)
        
        const token = authHeader.split(' ')[1]
        
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
            if(err) return res.sendStatus(403)
            
            if (typeof decoded === 'object' && decoded.UserInfo) {
                req.UserInfo = {
                    id: decoded.UserInfo.id,
                    name: decoded.UserInfo.name,
                    surname: decoded.UserInfo.surname,
                    email: decoded.UserInfo.email,
                    age: decoded.UserInfo.age,
                    role: decoded.UserInfo.role,
                }
                
                next()
            }
        })
    }
}