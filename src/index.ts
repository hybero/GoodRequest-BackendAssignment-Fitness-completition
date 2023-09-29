import http from 'http'
import express from 'express'
// import * as bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'

import { sequelize } from './db'
import { ProgramRouter } from './routes/programs'

// Admin routers
import { AdminExerciseRouter } from './routes/admin/exercises'
import { AdminUserRouter } from './routes/admin/users'

// User routers
import { UserRouter } from './routes/users'

// Public routers
import { RegisterRouter } from './routes/register'
import { LoginRouter } from './routes/login'
import { LogoutRouter } from './routes/logout'
import { RefreshRouter } from './routes/refresh'
import { verifyJWT } from './middleware/verifyJWT'

const app = express()

// Original parsing
// app.use(bodyParser.urlencoded({ extended: true }))
// app.use(bodyParser.json())

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

// Middleware for verifying JsonWebToken
app.use(verifyJWT)

// Admin api routes
app.use('/admin/exercises', AdminExerciseRouter)
app.use('/admin/users', AdminUserRouter)

// User routes
app.use('/programs', ProgramRouter)

app.use('/users', UserRouter)


const httpServer = http.createServer(app)

sequelize.sync()

console.log('Sync database', 'postgresql://localhost:5432/fitness_app')

httpServer.listen(8000).on('listening', () => console.log(`Server started at port ${8000}`))

export default httpServer