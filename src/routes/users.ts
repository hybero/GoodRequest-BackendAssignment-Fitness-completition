import { Router, Request, Response } from 'express'

import { UserModel } from '../db/user'
import { models } from '../db'

const router: Router = Router()

router.get('/', async (req: Request, res: Response) => {
	const users = await UserModel.findAll()
	return res.json({
		data: users,
		message: 'List of users'
	})
})

export { router as UserRouter }