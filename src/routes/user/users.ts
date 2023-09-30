import { Router, Request, Response } from 'express'
import { verifyRoles } from '../../middleware/verifyRoles'
import { UpdatedRequest } from '../../middleware/verifyJWT'
import { models } from '../../db'
import { localize } from '../../utils/localizator'

const router: Router = Router()

const {
	User
} = models

router.get('/', verifyRoles('USER'), async (req: Request, res: Response) => {

	const users = await User.findAll({
		attributes: ['id', 'nickName']
	})

	if(!users) return res.status(404).json({ 'message': localize(req, 'No users were found.') })
	
	return res.json({
		data: users,
		message: localize(req, 'List of users.')
	})
})

router.get('/own', verifyRoles('USER'), async (req: UpdatedRequest, res: Response) => {

	const user = await User.findAll({
		where: { id: req.UserInfo.id }
	})

	if(!user) return res.status(404).json({ 'message': localize(req, 'User was not found.') })
	
	return res.json({
		data: user,
		message: localize(req, 'Your details.')
	})
})

export { router as UserUsersRouter }