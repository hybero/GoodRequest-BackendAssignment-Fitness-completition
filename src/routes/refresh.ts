import { Router, Request, Response } from 'express'
import express from 'express'
const router: Router = express.Router()
import 'dotenv/config'
import jwt from 'jsonwebtoken'
import { UserModel } from '../db/user'

router.get('/', async (req: Request, res: Response) => {
    
    const cookies = req.cookies
    
    if(!cookies?.jwt) return res.sendStatus(401)
    
    const refreshToken = cookies.jwt

    const foundUser = await UserModel.findOne({
        where: { 
            refreshToken: refreshToken
        }    
    })
    
    if(!foundUser) return res.sendStatus(403)
    
    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        async (err: any, decoded: any) => {
            if(err || foundUser.email !== decoded.UserInfo.email) return res.sendStatus(403)
            
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

            res.json({ 'data': { 'accessToken': accessToken }, 'message': 'Refresh token successful.' }) 
        }
    )

})

export { router as RefreshRouter }