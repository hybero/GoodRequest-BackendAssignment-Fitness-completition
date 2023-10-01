import { format } from 'date-fns'
import { v4 as uuid } from 'uuid'
import fs from 'node:fs'
import * as fspromises from 'node:fs/promises'
import path from 'node:path'
import { Request, Response, NextFunction } from 'express'

export const logEvents = async (message: string, file: string) => {
    
    const dateTime = format(new Date(), 'yyyy-mm-dd\tHH:ii:ss')
    const logItem = `${dateTime}\t${uuid()}\t${message}\n`
    
    if(!fs.existsSync(path.join(__dirname, '..', 'logs'))) {
        await fspromises.mkdir(path.join(__dirname, '..', 'logs'))
    }

    await fspromises.appendFile(path.join(__dirname, '..', 'logs', `${file}.txt`), logItem, { encoding: 'utf-8'})   
}

export const logger = (req: Request, res: Response, next: NextFunction) => {
    
    logEvents(`${req.method}\t${req.headers.origin}\t${req.path}`, 'log')
    next()
}