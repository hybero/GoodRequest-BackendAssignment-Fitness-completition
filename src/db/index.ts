/* eslint import/no-cycle: 0 */

import path from 'path'
import fs from 'fs'
import { Dialect, Sequelize } from 'sequelize'
import { dbConfig } from '../config/db.config'

import defineExercise from './exercise'
import defineProgram from './program'

const sequelize: Sequelize = new Sequelize(`postgresql://${dbConfig.USER}:${dbConfig.PASSWORD}@${dbConfig.HOST}:5432/fitness_app`, {
	dialect: dbConfig.dialect as Dialect,
	logging: false
})

sequelize.authenticate().catch((e: any) => console.error(`Unable to connect to the database${e}.`))

const modelsBuilder = (instance: Sequelize) => ({
	// Import models to sequelize
	Exercise: instance.import(path.join(__dirname, 'exercise'), defineExercise),
	Program: instance.import(path.join(__dirname, 'program'), defineProgram),
})

const models = modelsBuilder(sequelize)

// check if every model is imported
const modelsFiles = fs.readdirSync(__dirname)
// -1 because index.ts can not be counted
if (Object.keys(models).length !== (modelsFiles.length - 1)) {
	throw new Error('You probably forgot import database model!')
}

Object.values(models).forEach((value: any) => {
	if (value.associate) {
		value.associate(models)
	}
})

export { models, modelsBuilder, sequelize }
