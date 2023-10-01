import { Router, Request, Response } from 'express'
import bcrypt from 'bcrypt'
import { validateEmail } from '../utils/emailValidator'
import { localize } from '../utils/localizator'
import { models } from '../db'

const router: Router = Router()

const {
    User
} = models

router.post('/', async (req: Request, res: Response) => {

    if(!req.body.email || !req.body.password || !req.body.role) {
        return res.status(400).json({ 'message': localize(req, 'Properties email, password, role are required.') })
    }

    if(!validateEmail(req.body.email)) return res.status(400).json({ 'message': localize(req, 'Parameter email is not a valid email address.') })

    const emailExists = await User.findOne({
        where: {
            email: req.body.email
        }
    })

    if(emailExists) return res.status(400).json({ 'message': localize(req, 'Email already in use.') })

    const hashedPwd = await bcrypt.hash(req.body.password, 10)
    
    const user = await User.create({
        name: req.body.name || null,
        surname: req.body.surname || null,
        nickName: req.body.nickName || null,
        email: req.body.email,
        password: hashedPwd,
        age: req.body.age || null,
        role: req.body.role
    })

    const userData = user.toJSON()

    return res.json({
        data: userData,
        message: localize(req, 'New user was created.')
	})
})

export { router as RegisterRouter }