/* eslint import/no-cycle: 0 */

import {
	Sequelize,
	DataTypes,
	Model
} from 'sequelize'
import { DatabaseModel } from '../types/db'
import { ExerciseModel } from './exercise'
import { UserModel } from './user'

export class UserExerciseModel extends DatabaseModel {
	id: number
    completed: string
	duration: number
}

export default (sequelize: Sequelize) => {
	
    UserExerciseModel.init({
		id: {
			type: DataTypes.BIGINT,
			primaryKey: true,
			allowNull: false,
			autoIncrement: true
		},
        completed: {
            type: DataTypes.DATE,
			allowNull: false
        },
		duration: {
			type: DataTypes.BIGINT,
			allowNull: false
		}
	}, {
		timestamps: true,
		sequelize,
		modelName: 'UserExercise',
        tableName: 'users_exercises',
	})

    UserExerciseModel.associate = (models) => {
        
        UserModel.belongsToMany(ExerciseModel, {
            through: UserExerciseModel,
            foreignKey: {
                name: 'userID',
                allowNull: false
            }
        });

        ExerciseModel.belongsToMany(UserModel, {
            through: UserExerciseModel,
            foreignKey: {
                name: 'exerciseID',
                allowNull: false
            }
        });
	}

	return UserExerciseModel
}