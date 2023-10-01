import http from 'http'
import express from 'express'
import cookieParser from 'cookie-parser'

import { sequelize } from './db'

// Custom middleware
import { verifyJWT } from './middleware/verifyJWT'
import { localizationHeaders } from './middleware/localization'

// Admin routers
import { AdminExercisesRouter } from './routes/admin/exercises'
import { AdminUsersRouter } from './routes/admin/users'

// User routers
import { UserUsersRouter } from './routes/user/users'
import { UserExercisesRouter } from './routes/user/exercises'

// Public routers
import { ProgramRouter } from './routes/programs'
import { RegisterRouter } from './routes/register'
import { LoginRouter } from './routes/login'
import { LogoutRouter } from './routes/logout'
import { RefreshRouter } from './routes/refresh'
import { logEvents, logger } from './utils/logEvents'
import { errorHandler } from './utils/errorHandler'

const app = express()

// Log requests
app.use(logger)

// Parse requests of content-type - application/json
app.use(express.json());

// Parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// Parse cookies
app.use(cookieParser())

// Get/Set localization header
app.use(localizationHeaders)

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

// Error handling
app.use(errorHandler)

const httpServer = http.createServer(app)

sequelize.sync()

console.log('Sync database', 'postgresql://localhost:5432/fitness_app')

httpServer.listen(8000).on('listening', () => {
    console.log(`Server started at port ${8000}`)

    // All uncaught exceptions end here
    process.on('uncaughtException', err => {
        console.log(`uncaughtException: ${err}`)
        
        // Log error event to log file
        logEvents(`${err.name}\t${err.message}`, 'uncaughtExceptionsLog')

        // Do we want to stop the app if uncaught exception occurs?
        // process.exit(1)
    })
})

export default httpServer