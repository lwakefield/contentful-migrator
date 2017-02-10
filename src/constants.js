import {readFileSync} from 'fs'

export const TEMPLATE_STR = readFileSync(`${__dirname}/template.js`).toString()
export const MIGRATIONS_ID = '__migrations'
export const DEFAULT_LOCALE = 'en-US'

