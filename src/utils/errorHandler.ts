import { Request, Response, NextFunction } from 'express';
import { logEvents } from './logEvents';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    
    logEvents(`${err.name}\t${err.message}`, 'errorLog')
    
    console.error(err)
    
    res.status(500).json({ 'data': {}, 'message': err.message })
}