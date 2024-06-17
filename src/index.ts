import express, { NextFunction, Request, Response } from 'express';
import Joi from 'joi';

import { logger } from './logging.service';
import { getPerformance } from './shopee.service';
import { DateTime } from 'luxon';

const app = express();

app.use(({ method, path, query, body }, res, next) => {
    logger.debug({ method, path, query, body });
    res.on('finish', () => {
        logger.debug({ method, path, query, body, status: res.statusCode });
    });
    next();
});

app.use('/', (req, res, next) => {
    const options = {
        start: DateTime.utc().minus({ day: 7 }).toISODate(),
        end: DateTime.utc().toISODate(),
    };
    Promise.all(['179124960', '653870673'].map((shopId) => getPerformance(shopId, options)))
        .then((results) => {
            res.status(200).json({ results });
        })
        .catch(next);
});

app.use((error: any, req: Request, res: Response, next: NextFunction) => {
    if (Joi.isError(error.error)) {
        logger.warn({ error: error.error });
        res.status(400).json({ error: error.error });
        return;
    }
    logger.error({ error });
    res.status(500).json({ error });
});

app.listen(8080);
