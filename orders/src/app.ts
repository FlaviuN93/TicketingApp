import express, { Request, Response } from 'express'
import 'express-async-errors'
import { json } from 'body-parser'
import cookieSession from 'cookie-session'
import { NotFoundError, errorHandler, currentUser } from '@fntickets30/common'
import { createOrderRouter } from './routes/create-order'
import { getOrderRouter } from './routes/get-order'
import { getAllOrdersRouter } from './routes/get-all-orders'
import { deleteOrderRouter } from './routes/delete-order'
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
app.use(createOrderRouter)
app.use(getOrderRouter)
app.use(getAllOrdersRouter)
app.use(deleteOrderRouter)

app.all('*', async (req: Request, res: Response) => {
  throw new NotFoundError()
})
app.use(errorHandler)

export { app }
