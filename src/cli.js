import Chain from './chain'
import Migrator from './migrator'
import {info} from './util'

function argparse (args = process.argv.slice(2)) {
    const isLongOpt = v => v && v.startsWith('--')
    const isShortOpt = v => v && v.startsWith('-')
    const isOpt = v => v && isLongOpt(v) || isShortOpt(v)
    const getOptName = v => v && (v.match(/^--?(\w+)/) || [])[1]
    const getOptVal = v => v && (v.match(/^--?\w+=?(.+)?/) || [])[1] || true

    const result = {}
    while (args.length) {
        const arg = args.shift()
        const peek = args[0]

        if (isOpt(arg)) {
            result[getOptName(arg)] = peek && !isOpt(peek)
                ? peek
                : getOptVal(arg)
            if (!isOpt(peek)) args.shift()
        } else {
            result._ = (result._ || []).concat(arg)
        }
    }

    return result
}

const {CONTENTFUL_SPACE_ID, CONTENTFUL_ACCESS_TOKEN} = process.env
process.env.DEBUG = true

const args = argparse()
const program = (args._ || [])[0]

if (program === 'create') {
    const chain = new Chain(process.cwd())
    const migration = chain.createMigration(args._[1] || '')
    // eslint-disable-next-line no-console
    info(`Created migration ${migration.path}`)
} else if (program === 'up') {
    Migrator.get(
        CONTENTFUL_SPACE_ID,
        process.cwd(),
        CONTENTFUL_ACCESS_TOKEN
    ).then(migrator => migrator.upgradeTo(args._[1]))
} else if (program === 'down') {
    Migrator.get(
        CONTENTFUL_SPACE_ID,
        process.cwd(),
        CONTENTFUL_ACCESS_TOKEN
    ).then(migrator => migrator.downgradeTo(args._[1]))
}
