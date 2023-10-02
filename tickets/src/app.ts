import express from 'express'
import 'express-async-errors'
import { json } from 'body-parser'
import cookieSession from 'cookie-session'
import { NotFoundError, errorHandler, currentUser } from '@fntickets30/common'
import { createTicketRouter } from './routes/create-ticket'
import { getTicketRouter } from './routes/get-ticket'
import { getAllTicketsRouter } from './routes/get-all-tickets'
import { updateTicketRouter } from './routes/update-ticket'

const app = express()
app.set('trust proxy', true)
app.use(json())

app.use(
  cookieSession({
    signed: false,
    secure: false,
  })
)

app.use(currentUser)
app.use(createTicketRouter)
app.use(getTicketRouter)
app.use(getAllTicketsRouter)
app.use(updateTicketRouter)

app.all('*', async (req, res) => {
  throw new NotFoundError()
})
app.use(errorHandler)

export { app }
