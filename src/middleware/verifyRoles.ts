import { Request, Response, NextFunction } from 'express'

interface UpdatedRequest extends Request {
    UserInfo: {
        role: string;
    };
}

export const verifyRoles = (...allowedRoles: Array<string>) => {
    return (req: UpdatedRequest, res: Response, next: NextFunction) => {
        
        if(!req.UserInfo.role) return res.sendStatus(401)
        
        const rolesArray = [...allowedRoles]

        const result = rolesArray.includes(req.UserInfo.role)
        
        if(!result) {
            return res.sendStatus(401)
        }
        
        next()
    }
}