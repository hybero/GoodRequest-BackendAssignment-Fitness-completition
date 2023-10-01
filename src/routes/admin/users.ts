import { Router, Request, Response } from 'express'
import { localize } from '../../utils/localizator'
import { models } from '../../db'

const router: Router = Router()

const {
	User
} = models


router.get('/', async (req: Request, res: Response) => {
	
	const users = await User.findAll()

	if(!users) return res.status(404).json({ 'message': localize(req, 'No users were found.') })
	
	return res.json({
		data: users,
		message: localize(req, 'List of users.')
	})
})

router.get('/:id?', async (req: Request, res: Response) => {

	if(!req.params.id) return res.status(400).json({ 'message': localize(req, 'Parameter id is required.') })
	
	const user = await User.findOne({
		where: { id: req.params.id }
	})

	if(!user) return res.status(404).json({ 'message': localize(req, 'User not found.') })
	
	return res.json({
		data: user,
		message: localize(req, 'User was found.')
	})
})

router.put('/:id?', async (req: Request, res: Response) => {

	if(!req.params.id) return res.status(400).json({ 'message': localize(req, 'Parameter id is required.') })
	
	const user = await User.findOne({
		where: { id: req.params.id }
	})

	if(!user) return res.status(404).json({ 'message': localize(req, 'User not found.') })

	if('name' in req.body) user.name = req.body.name
	if('surname' in req.body) user.surname = req.body.surname
	if('nickName' in req.body) user.nickName = req.body.nickName
	if('age' in req.body) user.age = req.body.age
	if('role' in req.body) user.role = req.body.role

	user.save()
	
	return res.json({
		data: user,
		message: localize(req, 'User was updated.')
	})
})

export { router as AdminUsersRouter }