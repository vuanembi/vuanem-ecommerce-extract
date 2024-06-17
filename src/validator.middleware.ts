import { createValidator } from 'express-joi-validation';

export const validator = createValidator({ passError: true, joi: { abortEarly: false, allowUnknown: true } });
