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
        name: req.body.name,
        surname: req.body.surname,
        nickName: req.body.nickName,
        email: req.body.email,
        password: hashedPwd,
        age: req.body.age,
        role: req.body.role
    })

    const { id, name, surname, nickName, email, age, role } = user;

    return res.json({
        data: {
            id,
            name,
            surname,
            nickName,
            email,
            age,
            role,
        },
        message: localize(req, 'New user was created.')
	})
})

export { router as RegisterRouter }