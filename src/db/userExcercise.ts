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
    completed: Date | null
	duration: number
    userID: number
    exerciseID: number
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
            type: DataTypes.DATE
        },
		duration: {
			type: DataTypes.BIGINT,
			allowNull: false
		},
        userID: {
          type: DataTypes.BIGINT,
          allowNull: false,
        },
        exerciseID: {
          type: DataTypes.BIGINT,
          allowNull: false,
        }
	}, {
		timestamps: true,
		sequelize,
		modelName: 'UserExercise',
        tableName: 'users_exercises',
        indexes: [
            // Add an index to improve query performance
            {
                // Using to remove unique constraint for foreign keys, but it does not work as expected
                unique: false,
                fields: ['userID', 'exerciseID'],
            },
        ]
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