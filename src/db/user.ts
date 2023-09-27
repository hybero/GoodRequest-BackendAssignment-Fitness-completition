/* eslint import/no-cycle: 0 */

import {
	Sequelize,
	DataTypes,
	Model
} from 'sequelize'
import { DatabaseModel } from '../types/db'
import { ProgramModel } from './program'

export class UserModel extends DatabaseModel {
    [x: string]: any
	id: Number
	name: String
	surname: String
	nickName: String
	email: String
	age: Number
	role: String
}

export default (sequelize: Sequelize) => {
	UserModel.init({
		id: {
			type: DataTypes.BIGINT,
			primaryKey: true,
			allowNull: false,
			autoIncrement: true
		},
		name: {
			type: DataTypes.STRING(200),
		},
		surname: {
			type: DataTypes.STRING(200),
		},
		nickName: {
			type: DataTypes.STRING(200),
		},
		email: {
			type: DataTypes.STRING(300),
		},
		password: {
			type: DataTypes.STRING(200),
		},
		age: {
			type: DataTypes.INTEGER,
		},
		role: {
			type: DataTypes.STRING(30),
		}
	}, {
		paranoid: true,
		timestamps: true,
		sequelize,
		modelName: 'user'
	})

	return UserModel
}
