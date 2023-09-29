import { Router, Request, Response } from 'express'
import { verifyRoles } from '../../middleware/verifyRoles'
import { UpdatedRequest } from '../../middleware/verifyJWT'

import { models } from '../../db'
import Op from 'sequelize/types/lib/operators'
import { UserExerciseModel } from '../../db/userExcercise'

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

router.get('/completed', verifyRoles('USER'), async (req: UpdatedRequest, res: Response) => {

    const exercisesTracks = await UserExercise.findAll({
        where: {
            userID: req.UserInfo.id
        }
    })

    if(!exercisesTracks) return res.status(404).json({ 'message': 'No exercises were found.' })

    // Group tracks by exercises
    const groupedExercisesTracks = groupExercisesTracks(exercisesTracks)

    // Filter exercises to only completed
    const filteredCompletedExercises = filterCompletedExercises(groupedExercisesTracks)

    return res.status(200).json({ 'data': filteredCompletedExercises, 'message': 'Completed exercises.' })
})

router.get('/', verifyRoles('USER'), async (req: UpdatedRequest, res: Response) => {

    const exercisesTracks = await UserExercise.findAll({
        where: {
            userID: req.UserInfo.id
        }
    })

    if(!exercisesTracks) return res.status(404).json({ 'message': 'No exercises were found.' })

    // Group tracks by exercises
    const groupedExercisesTracks = groupExercisesTracks(exercisesTracks)

    return res.status(200).json({ 'data': groupedExercisesTracks, 'message': 'All exercises.' })
})

const groupExercisesTracks = (exercisesTracks: any) => {
    const sortedExercises: any[] = []

    exercisesTracks.forEach((track: any) => {
        // Creating index for array
        let index = Number(track.exerciseID) - 1
        
        // define tracks list for exercise if does not exist yet
        if(!sortedExercises[index]) {
            sortedExercises[index] = {
                exerciseID: Number(track.exerciseID),
                tracks: [], // Initialize tracks as an empty array
                totalDuration: 0, // Initialize totalDuration to 0
                completed: null // Initialize completed to null
            };
        }

        // Push the track into the tracks array
        sortedExercises[index].tracks.push(track.toJSON());

        // Add the duration to the totalDuration
        sortedExercises[index].totalDuration += Number(track.duration);

        // Set completed for exercise if track with datetime in completed field is found
        if(track.completed) {
            sortedExercises[index].completed = track.completed;
        }
    })

    return sortedExercises
}

const filterCompletedExercises = (sortedExercises: Array<Object>) => {
    const filteredExercises: any[] = []

    sortedExercises.forEach((exercise: any) => {
        if(exercise.completed) {
            filteredExercises.push(exercise)
        }
    })

    return filteredExercises
}

export { router as UserExercisesRouter }