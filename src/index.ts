import express, { Express, NextFunction, Request, Response } from 'express'
import dotenv from 'dotenv'
import { start_mongo_connection } from './models/startup'
import { config_router } from './api/config'
import { guild_router } from './api/guild'
import { user_router } from './api/user'
import { public_user_router } from './public_api/user'
import { fetchTokenProfileByToken } from './models/token_schema'
import { rateLimit } from 'express-rate-limit'
import { public_frame_router } from './public_api/frame'

//setup environment variables
dotenv.config()

//Create express app
const app: Express = express()
const PORT = process.env.PORT || 3000

//Interfaces for classes
interface keyRequest extends Request {
    key?: string
}

//Middleware for API keys
app.use('/api', async (req: keyRequest, res: Response, next: NextFunction) => {
    const headers = req.headers['authorization']
    if (!headers) return res.status(401).json({ error: 'No API token' })

    const key = headers.split(' ')[1]
    if ((await fetchTokenProfileByToken(key)) == null)
        return res.status(401).json({ error: 'Invalid API token' })

    req.key = key
    next()
})

//Rate limiter for the API. Max 100 requests per 15 minutes. If the token is valid, the rate limit is not applied.
app.use(
    rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 100,
        standardHeaders: 'draft-7',
        legacyHeaders: false,
        skip: async (req: keyRequest) =>
            (await fetchTokenProfileByToken(
                req.headers['authorization']?.split(' ')[1] as string,
            )) != null, //skip if the token is valid, otherwise apply rate limit to the ta;
    }),
)

//routers
app.use('/api/config', config_router)
app.use('/api/guild', guild_router)
app.use('/api/user', user_router)

//public api
app.use('/public_api/user', public_user_router)
app.use('/public_api/frame', public_frame_router)

//root endpoint
app.get('/', (req: Request, res: Response) => {
    res.json({ service: 'OK' })
})

app.listen(PORT, async () => {
    await start_mongo_connection()
    console.log(
        `[server]: Server and datamodel is running at http://localhost:${PORT}`,
    )
})
