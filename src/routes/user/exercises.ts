import { Router, Response } from 'express'
import { verifyRoles } from '../../middleware/verifyRoles'
import { UpdatedRequest } from '../../middleware/verifyJWT'

import { models } from '../../db'
import { Op } from 'sequelize'

const router: Router = Router()

const {
    UserExercise
} = models

router.post('/track', verifyRoles('USER'), async (req: UpdatedRequest, res: Response) => {

    if(!req.body.exerciseID || !req.body.duration) return res.status(400).json({ 'message': 'Parameter exerciseID and duration are required.' })

    // Check if completed (true) was sent in request
    const completed = req.body.completed ? new Date() : null;

    const foundUserExercise = await UserExercise.findOne({
        where: {
            userID: req.UserInfo.id,
            exerciseID: req.body.exerciseID
        }
    })

    let userExercise = null
    let message = ''

    if(!foundUserExercise) {
        // Create tracking
        userExercise = await UserExercise.create({
            duration: Number(req.body.duration),
            completed: completed,
            userID: Number(req.UserInfo.id),
            exerciseID: Number(req.body.exerciseID)
        })

        message = 'Tracking of users exercise created.'
    } else {
        // Update tracking
        foundUserExercise.duration = Number(foundUserExercise.duration) + Number(req.body.duration)
        foundUserExercise.completed = completed
        foundUserExercise.save()

        message = 'Tracking of users exercise updated.'
    }
	
	return res.json({
		data: userExercise || foundUserExercise,
		message: message
	})
})

router.get('/completed', verifyRoles('USER'), async (req: UpdatedRequest, res: Response) => {

    const completedExercises = await UserExercise.findAll({
        where: {
            userID: req.UserInfo.id,
            completed: {
                [Op.ne]: null
            }
        }
    })

    if(!completedExercises) return res.status(404).json({ 'message': 'No completed exercises were found.' })

    return res.status(200).json({ 'data': completedExercises, 'message': 'Completed exercises.' })
})

router.get('/', verifyRoles('USER'), async (req: UpdatedRequest, res: Response) => {

    const exercises = await UserExercise.findAll({
        where: {
            userID: req.UserInfo.id
        }
    })

    if(!exercises) return res.status(404).json({ 'message': 'No exercises were found.' })

    return res.status(200).json({ 'data': exercises, 'message': 'All exercises.' })
})

router.delete('/:id?', verifyRoles('USER'), async (req: UpdatedRequest, res: Response) => {

    if(!req.params.id) return res.status(400).json({ 'message': 'Parameter id is required.' })

    const exercise = await UserExercise.findOne({
        where: {
            userID: req.UserInfo.id,
            exerciseID: req.params.id
        }
    })

    if(!exercise) return res.status(404).json({ 'message': 'Exercise was not found.' })

    if(exercise.completed === null) return res.status(422).json({ 'data': exercise, 'message': 'Can not delete the exercise, because the exercise is not completed.' })

    await UserExercise.destroy({
		where: { 
            userID: req.UserInfo.id,
            exerciseID: req.params.id
        }
	});
	
	return res.json({ 'message': 'Exercise deleted.' })
})

export { router as UserExercisesRouter }