import { json, Request, Response, Router } from 'express'
import fs from 'fs'
import { generateFrame } from '../functions/generateFrame'
import { fetch_config } from '../models/config_schema'
import path from 'path'
import sanitize from 'sanitize-filename'
import { fetch_guild_config } from '../models/guild_schema'

const public_frame_router = Router()
public_frame_router.use(json())

//POST /public_api/frame/generate
//Returns the generated frame for the user
public_frame_router.post('/generate', async (req: Request, res: Response) => {
    if (req.body == null) return res.status(400).json({ error: 'Missing body' })
    const json_body = req.body
    if (
        json_body.userid == null ||
        json_body.frame_id == null ||
        json_body.hex_color == null ||
        json_body.username == null ||
        json_body.level == null ||
        json_body.xp_percentage == null
    )
        return res.status(400).json({ error: 'Missing fields' })

    const config = await fetch_config(process.env.API_CONFIG_ID as string)

    const member_avatar_url =
        json_body.avatar_url != null ? json_body.avatar_url : null

    const cache_path = path.resolve('./cache')

    if (!fs.existsSync(cache_path)) {
        fs.mkdirSync(cache_path)
    }

    const user_id = sanitize(json_body.userid)

    if (
        !(config.cacheQueue as unknown as Array<string>).includes(user_id) ||
        json_body?.force == true
    ) {
        const photo = await generateFrame(
            json_body.username,
            json_body.frame_id,
            json_body.hex_color,
            json_body.level,
            json_body.xp_percentage,
            member_avatar_url,
        )
        if (photo == null)
            return res.status(500).json({ error: 'Error generating photo' })
        const fiels = fs.readdirSync(cache_path)
        if (fiels.length > 100) {
            const id = (config.cacheQueue as unknown as Array<string>).shift()
            fs.rmSync(`${cache_path}/${id}.png`)
        }

        fs.writeFileSync(`${cache_path}/${user_id}.png`, photo)

        if (!(config.cacheQueue as unknown as Array<string>).includes(user_id))
            (config.cacheQueue as unknown as Array<string>).push(user_id)
        config.save()
    } else {
        const check_file = fs.realpathSync(
            path.resolve(cache_path, user_id + '.png'),
        )
        if (!check_file.startsWith(cache_path)) {
            return res.status(400).json({ error: 'Invalid path' })
        }
    }
    res.sendFile(`${cache_path}/${json_body.userid}.png`)
})

//POST /public_api/frame/get/config
//Returns the frame config for the given guild
public_frame_router.post('/get/config', async (req: Request, res: Response) => {
    if (req.body == null) return res.status(400).json({ error: 'Missing body' })
    const json_body = req.body
    if (json_body.guildId == null)
        return res.status(400).json({ error: 'Missing fields' })

    const guild_id = sanitize(json_body.guildId)
    const config = await fetch_guild_config(guild_id)
    //eslint-disable-next-line
    let frame_config: any[] = config?.frameConfig as unknown as any[]
    frame_config.map(
        (frame) =>
            (frame.frameLink = `https://api.sgc.se/public_api/frame/get/${guild_id}/${frame.id}`),
    )
    return res.json(frame_config)
})

public_frame_router.get(
    '/get/:guildId/:frameId',
    async (req: Request, res: Response) => {
        const guild_id = sanitize(req.params['guildId'])
        const frame_id = sanitize(req.params['frameId'])
        const config = await fetch_guild_config(guild_id)
        //eslint-disable-next-line
        const frame = (config?.frameConfig as unknown as Array<any>)[
            parseInt(frame_id)
        ]
        if (frame == null)
            return res.status(400).json({ error: 'Invalid frame id' })

        res.sendFile(path.resolve('./') + '/' + frame.path)
    },
)

export { public_frame_router }
