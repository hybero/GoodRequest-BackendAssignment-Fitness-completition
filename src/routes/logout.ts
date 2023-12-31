import { Router, Request, Response } from 'express'
import express from 'express'
import 'dotenv/config'
import { localize } from '../utils/localizator'
import { models } from '../db'

const router: Router = express.Router()

const {
    User
} = models

router.get('/', async (req: Request, res: Response) => {
    
    const cookies = req.cookies

    if(!cookies?.jwt) return res.sendStatus(401).json({ 'message': localize(req, 'Missing cookie, nothing to do.') })
    
    const refreshToken = cookies.jwt
    
    const foundUser = await User.findOne(
        {
            where: { refreshToken: refreshToken }
        }
    )
    
    if(!foundUser) {
        res.clearCookie('jwt', { httpOnly: true })
        return res.status(403).json({ 'message': localize(req, 'User not found.') })
    }

    foundUser.accessToken = null
    foundUser.refreshToken = null

    await foundUser.save()

    res.clearCookie('jwt', { httpOnly: true })

    return res.status(200).json({ 'message': localize(req, 'User logged out.') })
})

export { router as LogoutRouter }