import { Router, Response } from 'express'
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

router.get('/completed', verifyRoles('USER'), async (req: UpdatedRequest, res: Response) => {

    const exercisesTracks = await UserExercise.findAll({
        where: {
            userID: req.UserInfo.id
        }
    })

    if(!exercisesTracks) return res.status(404).json({ 'message': 'No exercises tracks were found.' })

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

    if(!exercisesTracks) return res.status(404).json({ 'message': 'No exercises tracks were found.' })

    // Group tracks by exercises
    const groupedExercisesTracks = groupExercisesTracks(exercisesTracks)

    return res.status(200).json({ 'data': groupedExercisesTracks, 'message': 'All exercises.' })
})

router.delete('/:id?', verifyRoles('USER'), async (req: UpdatedRequest, res: Response) => {

    if(!req.params.id) return res.status(400).json({ 'message': 'Parameter id is required.' })

    const exerciseTracks = await UserExercise.findAll({
        where: {
            userID: req.UserInfo.id,
            exerciseID: req.params.id
        }
    })

    if(!exerciseTracks) return res.status(404).json({ 'message': 'No exercise tracks were found.' })

    // Group tracks by exercises
    const groupedTracks = groupExercisesTracks(exerciseTracks)

    if(groupedTracks[0].completed === null) return res.status(422).json({ 'data': groupedTracks[0], 'message': 'Can not delete the exercise tracks, because the exercise is not completed.' })

    await UserExercise.destroy({
		where: { 
            userID: req.UserInfo.id,
            exerciseID: req.params.id
        }
	});
	
	return res.json({ 'message': 'Exercise tracks deleted.' })
})

const groupExercisesTracks = (exercisesTracks: any) => {
    const groupedExercisesMap = new Map();

    exercisesTracks.forEach((track: any) => {
        const exerciseID = Number(track.exerciseID);

        // If the exerciseID is not in the map, create a new entry
        if (!groupedExercisesMap.has(exerciseID)) {
            groupedExercisesMap.set(exerciseID, {
                exerciseID,
                tracks: [],
                totalDuration: 0,
                completed: null,
            });
        }

        const exercise = groupedExercisesMap.get(exerciseID);

        exercise.tracks.push(track.toJSON());
        exercise.totalDuration += Number(track.duration);

        if (track.completed) {
            exercise.completed = track.completed;
        }
    });

    // Convert the Map values to an array
    const groupedExercises = Array.from(groupedExercisesMap.values());

    return groupedExercises;
};

const filterCompletedExercises = (groupedExercises: Array<Object>) => {
    const filteredExercises: any[] = []

    groupedExercises.forEach((exercise: any) => {
        if(exercise.completed) {
            filteredExercises.push(exercise)
        }
    })

    return filteredExercises
}

export { router as UserExercisesRouter }