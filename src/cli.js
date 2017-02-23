import Chain from './chain'
import Migrator from './migrator'
import {info} from './util'
import argparse from './argparse'

const args = argparse()
const program = (args._ || [])[0]
const {
    CONTENTFUL_SPACE_ID = args['space-id'],
    CONTENTFUL_ACCESS_TOKEN = args['access-token']
} = process.env
process.env.DEBUG = true

export function create () {
    const chain = new Chain(process.cwd())
    const migration = chain.createMigration(args._[1] || '')
    // eslint-disable-next-line no-console
    info(`Created migration ${migration.path}`)
}

export function up () {
    Migrator.get(
        CONTENTFUL_SPACE_ID,
        process.cwd(),
        CONTENTFUL_ACCESS_TOKEN
    ).then(migrator => migrator.upgradeTo(args._[1]))
}

export function down () {
    Migrator.get(
        CONTENTFUL_SPACE_ID,
        process.cwd(),
        CONTENTFUL_ACCESS_TOKEN
    ).then(migrator => migrator.downgradeTo(args._[1]))
}

export function help () {
    /* eslint-disable no-console */
    console.log('usage: contentful-migrator [up|down|create]')
    console.log('  up [ref]:      updates contentful to and including `ref`')
    console.log('                 ref is optional, defaults to the local head')
    console.log('  create [name]: creates a new contentful migration w/ `name`')
    console.log('                 name is optional')
    console.log('  down [ref]:    downgrades contentful to and including ref')
    console.log('                 ref is optional, defaults to the remote head^')
    /* eslint-enable no-console */
}

const toRun = {
    create,
    down,
    help,
    up
}[program] || help

toRun()
