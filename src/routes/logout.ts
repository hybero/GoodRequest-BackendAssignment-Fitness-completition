import { Router, Request, Response } from 'express'
import express from 'express'
const router: Router = express.Router()
import 'dotenv/config'
import { UserModel } from '../db/user'

router.get('/', async (req: Request, res: Response) => {
    
    const cookies = req.cookies

    if(!cookies?.jwt) return res.sendStatus(404).json({ 'message': 'Missing cookie, nothing to do.' })
    
    const refreshToken = cookies.jwt
    
    const foundUser = await UserModel.findOne(
        {
            where: { refreshToken: refreshToken }
        }
    )
    
    if(!foundUser) {
        res.clearCookie('jwt', { httpOnly: true })
        return res.status(204).json({ 'message': 'User not found.' })
    }

    foundUser.accessToken = null
    foundUser.refreshToken = null

    await foundUser.save()

    res.clearCookie('jwt', { httpOnly: true })

    return res.status(204).json({ 'message': 'User logged out.' })
})

export { router as LogoutRouter }