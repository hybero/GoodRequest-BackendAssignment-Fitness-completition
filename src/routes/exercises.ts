import { Router, Request, Response, NextFunction } from 'express'
import { verifyRoles } from '../middleware/verifyRoles'

import { models } from '../db'
import { ExerciseModel } from '../db/exercise'
import { EXERCISE_DIFFICULTY } from '../utils/enums'

const router: Router = Router()

const {
	Exercise,
	Program
} = models

router.get('/admin', verifyRoles('ADMIN'), async (req: Request, res: Response) => {
	
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

router.post('/admin', verifyRoles('ADMIN'), async (req: Request, res: Response) => {

	if(!req.body.difficulty || !req.body.name || !req.body.programID) return res.status(400).json({ 'message': 'Difficulty, name and programID are required.' })

	if(!Object.values(EXERCISE_DIFFICULTY).includes(req.body.difficulty)) return res.status(400).json({ 'message': 'Difficulty value is invalid.' })

	const { difficulty, name, programID } = req.body

	const exercise = await ExerciseModel.create({
		difficulty: difficulty,
		name: name,
		programID: programID || null
	})
	
	return res.json({
		data: exercise,
		message: 'Exercise created'
	})

})

router.put('/admin/:id?', verifyRoles('ADMIN'), async (req: Request, res: Response) => {

	if(!req.params.id) return res.status(400).json({ 'message': 'Parameter id is required.' })

	if(!Object.values(EXERCISE_DIFFICULTY).includes(req.body.difficulty)) return res.status(400).json({ 'message': 'Difficulty value is invalid.' })

	let exercise = await ExerciseModel.findOne({
		where: { id: req.params.id }
	})

	if('difficulty' in req.body) exercise.difficulty = req.body.difficulty
	if('name' in req.body) exercise.name = req.body.name
	if('programID' in req.body) exercise.programID = req.body.programID

	exercise.save()
	
	return res.json({
		data: exercise,
		message: 'Exercise updated'
	})

})

router.delete('/admin/:id?', verifyRoles('ADMIN'), async (req: Request, res: Response) => {

	if(!req.params.id) return res.status(400).json({ 'message': 'Parameter id is required.' })

	let exercise = await ExerciseModel.findOne({
		where: { id: req.params.id }
	})

	if(!exercise) return res.status(204).json({ 'message': `Exercise with id ${req.params.id} not found.` })

	await ExerciseModel.destroy({
		where: { id: req.params.id }
	  });
	
	return res.json({ 'message': 'Exercise deleted.' })

})

export { router as ExerciseRouter}