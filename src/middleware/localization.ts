import { Request, Response, NextFunction } from 'express'


export const localizationHeaders = (req: Request, res: Response, next: NextFunction) => {
    
    const localizationHeader: string = String(req.headers.localization) || 'en'

    if(!['sk', 'en'].includes(localizationHeader)) {
        req.headers.localization = 'en'
    }

    next()
}