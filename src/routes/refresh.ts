import { Router, Request, Response } from 'express'
import express from 'express'
import 'dotenv/config'
import jwt from 'jsonwebtoken'
import { localize } from '../utils/localizator'
import { models } from '../db'

const router: Router = express.Router()

const {
    User
} = models

router.get('/', async (req: Request, res: Response) => {
    
    const cookies = req.cookies
    
    if(!cookies?.jwt) return res.status(401).json({ 'message': localize(req, 'Missing cookie, nothing to do.') })
    
    const refreshToken = cookies.jwt

    const foundUser = await User.findOne({
        where: { 
            refreshToken: refreshToken
        }    
    })
    
    if(!foundUser) return res.status(403).json({ 'message': localize(req, 'User not found.') })
    
    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        async (err: any, decoded: any) => {
            if(err || foundUser.email !== decoded.UserInfo.email) return res.status(403).json({ 'message': localize(req, 'User not verified.') })
            
            const accessToken = jwt.sign(
                { 
                    'UserInfo': {
                        'id': foundUser.id,
                        'name': foundUser.name,
                        'surname': foundUser.surname,
                        'email': foundUser.email,
                        'age': foundUser.age,
                        'role': foundUser.role
                    }
                },
                process.env.ACCESS_TOKEN_SECRET,
                { 'expiresIn': '5m' }
            )

            foundUser.accessToken = accessToken

            await foundUser.save()

            res.json({ 'data': { 'accessToken': accessToken }, 'message': localize(req, 'Refresh token successful.') }) 
        }
    )

})

export { router as RefreshRouter }