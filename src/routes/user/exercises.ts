import { Router, Request, Response } from 'express'
import { verifyRoles } from '../../middleware/verifyRoles'
import { UpdatedRequest } from '../../middleware/verifyJWT'

import { models } from '../../db'

const router: Router = Router()

const {
    UserExercise
} = models

router.post('/track', verifyRoles('USER'), async (req: UpdatedRequest, res: Response) => {

    if(!req.body.exerciseID || !req.body.duration) return res.status(400).json({ 'message': 'Parameter exerciseID and duration are required.' })

    // Check if completed (true) was sent in request
    const completed = req.body.completed ? new Date() : null;

    // Track exercise for user
    const userExercise = await UserExercise.create({
        duration: req.body.duration,
        completed: completed,
        userID: req.UserInfo.id,
        exerciseID: req.body.exerciseID
    })
	
	return res.json({
		data: userExercise,
		message: 'Track of users exercise.'
	})
})

export { router as UserExercisesRouter }