import http from 'http'
import express from 'express'
import cookieParser from 'cookie-parser'

import { sequelize } from './db'
import { ProgramRouter } from './routes/programs'

// Admin routers
import { AdminExercisesRouter } from './routes/admin/exercises'
import { AdminUsersRouter } from './routes/admin/users'

// User routers
import { UserUsersRouter } from './routes/user/users'
import { UserExercisesRouter } from './routes/user/exercises'

// Public routers
import { RegisterRouter } from './routes/register'
import { LoginRouter } from './routes/login'
import { LogoutRouter } from './routes/logout'
import { RefreshRouter } from './routes/refresh'
import { verifyJWT } from './middleware/verifyJWT'

const app = express()

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser())

// Public routes
app.use('/register', RegisterRouter)
app.use('/login', LoginRouter)
app.use('/logout', LogoutRouter)
app.use('/refresh', RefreshRouter)

app.use('/programs', ProgramRouter)

// Middleware for verifying JsonWebToken
app.use(verifyJWT)

// Admin api routes
app.use('/admin/exercises', AdminExercisesRouter)
app.use('/admin/users', AdminUsersRouter)

// User routes
app.use('/user/exercises', UserExercisesRouter)
app.use('/user/users', UserUsersRouter)


const httpServer = http.createServer(app)

sequelize.sync()

console.log('Sync database', 'postgresql://localhost:5432/fitness_app')

httpServer.listen(8000).on('listening', () => console.log(`Server started at port ${8000}`))

export default httpServer