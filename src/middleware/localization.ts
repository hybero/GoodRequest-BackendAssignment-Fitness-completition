import { Request, Response, NextFunction } from 'express'


export const localizationHeaders = (req: Request, res: Response, next: NextFunction) => {
    
    const localizationHeader: string = String(req.headers.localization) || 'en'
    const lowerCaseLocalizationHeader = localizationHeader.toLowerCase()
    req.headers.localization = lowerCaseLocalizationHeader

    if(!['sk', 'en'].includes(lowerCaseLocalizationHeader)) {
        req.headers.localization = 'en'
    }

    next()
}