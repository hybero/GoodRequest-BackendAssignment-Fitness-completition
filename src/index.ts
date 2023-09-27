import http from 'http'
import express from 'express'
// import * as bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'

import { sequelize } from './db'
import ProgramRouter from './routes/programs'
import ExerciseRouter from './routes/exercises'
import { UserRouter } from './routes/users'
import { RegisterRouter } from './routes/register'
import { LoginRouter } from './routes/login'
import { LogoutRouter } from './routes/logout'

const app = express()

// Original parsing
// app.use(bodyParser.urlencoded({ extended: true }))
// app.use(bodyParser.json())

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser())

app.use('/programs', ProgramRouter())
app.use('/exercises', ExerciseRouter())

app.use('/register', RegisterRouter)
app.use('/login', LoginRouter)
app.use('/logout', LogoutRouter)

// app.use(verifyJwt)

app.use('/users', UserRouter)


const httpServer = http.createServer(app)

sequelize.sync()

console.log('Sync database', 'postgresql://localhost:5432/fitness_app')

httpServer.listen(8000).on('listening', () => console.log(`Server started at port ${8000}`))

export default httpServer