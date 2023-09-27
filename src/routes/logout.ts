import express from 'express'
const router = express.Router()
import 'dotenv/config'
import { UserModel } from '../db/user'

router.get('/', async (req, res) => {
    
    const cookies = req.cookies

    if(!cookies?.jwt) return res.sendStatus(204)
    
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

    return res.status(204).json({ 'message': 'User logged out' })
})

export { router as LogoutRouter }