import { Router, Request, Response, NextFunction } from 'express'
import { verifyRoles } from '../middleware/verifyRoles'

import { models } from '../db'

const router: Router = Router()

const {
	Exercise,
	Program
} = models

router.get('/', verifyRoles('ADMIN'), async (_req: Request, res: Response, _next: NextFunction) => {
	
	const exercises = await Exercise.findAll({
		include: [{
			model: Program,
			as: 'program'
		}]
	})

	return res.json({
		data: exercises,
		message: 'List of exercises'
	})
})

router.get('/', verifyRoles('ADMIN'), async (_req: Request, res: Response, _next: NextFunction) => {

})

export { router as ExerciseRouter}