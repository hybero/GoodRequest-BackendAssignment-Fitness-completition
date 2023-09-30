import { Request, Response, Router } from 'express'
import express from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import 'dotenv/config'
import { localize } from '../utils/localizator'
import { models } from '../db'

const router: Router = express.Router()

const {
    User
} = models

router.post('/', async (req: Request, res: Response) => {
    const { email, password } = req.body

    if(!email || !password) return res.status(400).json({ 'message': localize(req, 'Email and password are required.') })

    const foundUser = await User.findOne({
        where: {
            email: email
        }
    })

    if(!foundUser || foundUser === null) return res.status(401).json({ 'message': localize(req, 'User not found.') })
    
    const match = await bcrypt.compare(password, foundUser.password)
    
    if(!match) {
        return res.status(403).json({ 'message': localize(req, 'Wrong password.') })        
    } else {
        
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
            { 
                'expiresIn': '5m' 
            }
        )
        
        const refreshToken = jwt.sign(
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
            process.env.REFRESH_TOKEN_SECRET,
            { 
                'expiresIn': '1d' 
            }
        )

        foundUser.accessToken = accessToken
        foundUser.refreshToken = refreshToken

        await foundUser.save()

        res.cookie('jwt', refreshToken, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000})
        
        return res.status(200).json({ 'data': { accessToken: accessToken }, 'message': localize(req, 'User logged in.') })
    }
})

export { router as LoginRouter }