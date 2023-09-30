import { Router, Request, Response } from 'express'
import { verifyRoles } from '../../middleware/verifyRoles'

import { models } from '../../db'
import { EXERCISE_DIFFICULTY } from '../../utils/enums'
import { Op } from 'sequelize'

const router: Router = Router()

const {
	Exercise,
	Program
} = models

router.get('/', verifyRoles('ADMIN'), async (req: Request, res: Response) => {

	if(req.query.page && Number(req.query.page) < 1) return res.status(400).json({ 'message': 'Parameter page must be bigger than 0.' })

	if(req.query.limit && Number(req.query.limit) < 1) return res.status(400).json({ 'message': 'Parameter limit must be bigger than 0.' })

	if(req.query.programID && Number(req.query.programID) < 1) return res.status(400).json({ 'message': 'Parameter programID must be bigger than 0.' })

	if(req.query.search && String(req.query.search).length < 1) return res.status(400).json({ 'message': 'Search string must be at least 1 character long.' })

	let search = req.query.search ? req.query.search : null

	let offset = null
	let limit = null

	if(req.query.page && req.query.limit) {
		offset = (Number(req.query.page) -1) * Number(req.query.limit)
		limit = Number(req.query.limit)
	}

	let programID = req.query.programID ? req.query.programID : null

	let exercises = null

	if(search && !offset && !limit) {
		// We have search, ignoring pagination and filter by parameterID
		exercises = await Exercise.findAll({
			where: {
				name: { [Op.like]: '%' + search + '%' }
			},
			include: [{
				model: Program,
				as: 'program'
			}]
		})
	}
	else if(search && offset && limit) {
		// We have search, ignoring pagination and filter by parameterID
		exercises = await Exercise.findAll({
			where: {
				name: { [Op.like]: '%' + search + '%' }
			},
			offset: offset,
			limit: limit,
			include: [{
				model: Program,
				as: 'program'
			}]
		})
	} 
	else if(offset !== null && limit !== null && programID === null) {
		// We have pagination with no programID specified
		exercises = await Exercise.findAll({
			offset: offset,
			limit: limit,
			include: [{
				model: Program,
				as: 'program'
			}]
		})
	} 
	else if((offset !== null && limit !== null) && programID !== null) {
		// Return paginated exercises with specified programID
		exercises = await Exercise.findAll({
			where: {
				programID: programID
			},
			offset: offset,
			limit: limit,
			include: [{
				model: Program,
				as: 'program'
			}]
		})
	} 
	else if(programID !== null) {
		// We have programID and no pagination
		exercises = await Exercise.findAll({
			where: {
				programID: programID
			},
			include: [{
				model: Program,
				as: 'program'
			}]
		})
	} 
	else {
		// Return all exercises (No pagination, No programID)
		exercises = await Exercise.findAll({
			include: [{
				model: Program,
				as: 'program'
			}]
		})
	}

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