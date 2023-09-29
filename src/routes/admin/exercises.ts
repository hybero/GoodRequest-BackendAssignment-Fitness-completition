import { Router, Request, Response, NextFunction } from 'express'
import { verifyRoles } from '../../middleware/verifyRoles'

import { models } from '../../db'
import { EXERCISE_DIFFICULTY } from '../../utils/enums'

const router: Router = Router()

const {
	Exercise,
	Program
} = models

router.get('/', verifyRoles('ADMIN'), async (req: Request, res: Response) => {
	
	const exercises = await Exercise.findAll({
		include: [{
			model: Program,
			as: 'program'
		}]
	})

	if(!exercises) return res.status(404).json({ 'message': 'No exercises were found.' })

	return res.json({
		data: exercises,
		message: 'List of exercises.'
	})
})

router.post('/', verifyRoles('ADMIN'), async (req: Request, res: Response) => {

	if(!req.body.difficulty || !req.body.name || !req.body.programID) return res.status(400).json({ 'message': 'Difficulty, name and programID are required.' })

	if(!Object.values(EXERCISE_DIFFICULTY).includes(req.body.difficulty)) return res.status(400).json({ 'message': 'Difficulty value is invalid.' })

	const { difficulty, name, programID } = req.body

	const exercise = await Exercise.create({
		difficulty: difficulty,
		name: name,
		programID: programID || null
	})
	
	return res.json({
		data: exercise,
		message: 'Exercise created.'
	})

})

router.put('/:id?', verifyRoles('ADMIN'), async (req: Request, res: Response) => {

	if(!req.params.id) return res.status(400).json({ 'message': 'Parameter id is required.' })

	if(!Object.values(EXERCISE_DIFFICULTY).includes(req.body.difficulty)) return res.status(400).json({ 'message': 'Difficulty value is invalid.' })

	const exercise = await Exercise.findOne({
		where: { id: req.params.id }
	})

	if(!exercise) return res.status(404).json({ 'message': `Exercise with id ${req.params.id} not found.` })

	if('difficulty' in req.body) exercise.difficulty = req.body.difficulty
	if('name' in req.body) exercise.name = req.body.name
	if('programID' in req.body) exercise.programID = req.body.programID

	exercise.save()
	
	return res.json({
		data: exercise,
		message: 'Exercise updated.'
	})

})

router.delete('/:id?', verifyRoles('ADMIN'), async (req: Request, res: Response) => {

	if(!req.params.id) return res.status(400).json({ 'message': 'Parameter id is required.' })

	const exercise = await Exercise.findOne({
		where: { id: req.params.id }
	})

	if(!exercise) return res.status(404).json({ 'message': `Exercise with id ${req.params.id} not found.` })

	await Exercise.destroy({
		where: { id: req.params.id }
	  });
	
	return res.json({ 'message': 'Exercise deleted.' })

})

router.put('/:id?/program', verifyRoles('ADMIN'), async (req: Request, res: Response) => {

	if(!req.params.id) return res.status(400).json({ 'message': 'Parameter id is required.' })

	if(!req.body.name) return res.status(400).json({ 'message': 'Name is required.' })

	const exercise = await Exercise.findOne({
		attributes: ['programID'],
		where: { id: req.params.id }
	})

	if(!exercise) return res.status(404).json({ 'message': `Exercise with id ${req.params.id} not found.` })

	let program = await Program.findOne({
		where: { id: exercise.programID }
	})

	if(!program) return res.status(404).json({ 'message': `Program for exercise with id ${req.params.id} not found.` })

	program.name = req.body.name

	program.save()
	
	return res.json({
		data: program,
		message: 'Program updated.'
	})

})

export { router as AdminExercisesRouter}