import http from 'http'
import express from 'express'
// import * as bodyParser from 'body-parser'

import { sequelize } from './db'
import ProgramRouter from './routes/programs'
import ExerciseRouter from './routes/exercises'

const app = express()

// Original parsing
// app.use(bodyParser.urlencoded({ extended: true }))
// app.use(bodyParser.json())

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

app.use('/programs', ProgramRouter())
app.use('/exercises', ExerciseRouter())

// const httpServer = http.createServer(app)

// sequelize.sync()

// console.log('Sync database', 'postgresql://localhost:5432/fitness_app')

// httpServer.listen(8000).on('listening', () => console.log(`Server started at port ${8000}`))

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

// export default httpServer
