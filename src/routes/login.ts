import express from 'express'
const router = express.Router()
import path from 'node:path'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import 'dotenv/config'
import { UserModel } from '../db/user'

router.post('/', async (req, res) => {
    const { email, password } = req.body

    if(!email || !password) return res.status(400).json({ 'message': 'Email and password are required.' })

    const foundUser = await UserModel.findOne({
        where: {
            email: email
        }
    })

    if(!foundUser || foundUser === null) return res.status(401).json({ 'message': 'User not found.'})
    
    const match = await bcrypt.compare(password, foundUser.password)
    
    if(!match) {
        return res.status(403).json({ 'message': 'Wrong password' })        
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
        
        return res.status(200).json({ 'data': { accessToken: accessToken }, 'message': `User ${foundUser.name} ${foundUser.surname} logged in.`})
    }
})

export { router as LoginRouter }