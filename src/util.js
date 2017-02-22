import {execSync} from 'child_process'
import {randomBytes} from 'crypto'
import colors from 'colors/safe'

export const ls = path => execSync(`ls ${path}`).toString()
    .split('\n').filter(v => !!v)
export const cp = (from, to, args = '') =>
    execSync(`cp ${args} ${from} ${to} `)
export const rm = (path, args = '') =>
    execSync(`rm ${args} ${path}`)
export const randStr = len => randomBytes(len / 2).toString('hex')

export function log(str, level = 'info') {
    const tags = {
        info: colors.blue('[INFO]'),
        debug: colors.blue('[DEBUG]'),
        error: colors.blue('[ERROR]')
    }
    const tag = tags[level]
    if (!tag) throw new Error(`Invalid log level: ${level}`)

    // eslint-disable-next-line no-console
    console.log(`${tag}: ${str}`)
}

export const info = str => log(str, 'info')
export const debug = str => log(str, 'debug')
export const error = str => log(str, 'error')

export function arrayToObj(arr = [], fn) {
    return arr.reduce(
        (acc, val) => ({...acc, ...fn(val)}),
        {}
    )
}
