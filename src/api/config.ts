import { Router, Response, Request, json } from 'express'
import { fetch_config } from '../models/config_schema'
import { createTokenLog } from '../models/token_log_schema'

const config_router = Router()
config_router.use(json())

//GET /api/config/:configid
//Returns the configuration data for the given configid
config_router.get('/:configid', async (req: Request, res: Response) => {
    createTokenLog(
        req.headers['authorization'] as string,
        'GET /api/config/:configid',
        new Date(),
        { configid: req.params['configid'] },
    )
    const config_data = await fetch_config(req.params['configid'])
    if (config_data == null)
        return res.status(400).json({ error: 'No data with that ID' })

    res.json(config_data?.toJSON())
})

//POST /api/config/:configid
//Updates the configuration data for the given configid
config_router.post('/:configid', async (req: Request, res: Response) => {
    const json_body = req.body
    createTokenLog(
        req.headers['authorization'] as string,
        'POST /api/config/:configid',
        new Date(),
        { configid: req.params['configid'], body: json_body },
    )
    const config_data = await fetch_config(req.params['configid'])
    for (const key in json_body) {
        if (config_data?.get(key) == null)
            return res
                .status(400)
                .json({ error: `no ${key} key was found in the config` })
        config_data.set(key, json_body[key])
    }
    res.json({ message: 'Updated config' })
    config_data?.save()
})

//POST /api/config/:configid/add_obj
//Adds an object to the extraObjects map in the configuration data for the given configid
config_router.post(
    '/:configid/add_obj',
    async (req: Request, res: Response) => {
        const json_body = req.body
        createTokenLog(
            req.headers['authorization'] as string,
            'POST /api/config/:configid/add_obj',
            new Date(),
            { configid: req.params['configid'], body: json_body },
        )
        const config_data = await fetch_config(req.params['configid'])

        if (json_body.value == null || json_body.key == null)
            return res.status(400).json({ error: 'No value key in body' })

        config_data?.extraObjects.set(json_body.key, json_body.value)
        config_data?.save()
        res.json(config_data?.toJSON())
    },
)

//DELETE /api/config/:configid/remove_obj
//Removes an object from the extraObjects map in the configuration data for the given configid
config_router.delete(
    '/:configid/remove_obj',
    async (req: Request, res: Response) => {
        const json_body = req.body
        createTokenLog(
            req.headers['authorization'] as string,
            'DELETE /api/config/:configid/remove_obj',
            new Date(),
            { configid: req.params['configid'], body: json_body },
        )
        const config_data = await fetch_config(req.params['configid'])

        if (json_body.key == null)
            return res.status(400).json({ error: 'No key key in body' })

        config_data?.extraObjects.delete(json_body.key)
        config_data?.save()
        res.json(config_data?.toJSON())
    },
)

export { config_router }
