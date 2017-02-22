import {readFileSync} from 'fs'

export const TEMPLATE_STR = process.env.NODE_ENV === 'build' ?
    require(`raw-loader!${__dirname}/template.js`) :
    readFileSync(`${__dirname}/template.js`).toString()
export const MIGRATIONS_ID = '__migrations'
export const DEFAULT_LOCALE = 'en-US'

