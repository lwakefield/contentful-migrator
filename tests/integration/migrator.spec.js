import contentful from 'contentful-management'
require('dotenv').config()
jasmine.DEFAULT_TIMEOUT_INTERVAL = 100000;

import {
    Migrator
} from '../../src/migrator'
import {enumerate} from '../../src/space'
import {
    ls,
    cp,
    rm,
    randStr,
    info,
    error
} from '../../src/util'
import {
    sleep,
    cleanSpace
} from '../util'

const FIXTURE_PATH = `${__dirname}/../fixtures`

let SPACE
let SPACE_ID
beforeAll(async () => {
    const client = contentful.createClient(
        {accessToken: process.env.CONTENTFUL_ACCESS_TOKEN}
    )
    SPACE = await client.getSpace(process.env.CONTENTFUL_SPACE_ID)
    SPACE_ID = process.env.CONTENTFUL_SPACE_ID
})

describe('Migrator', () => {
    it('instantiates, upgrades then downgrades correctly', async () => {
        const migrator = await Migrator.get(
            SPACE_ID,
            FIXTURE_PATH,
            process.env.CONTENTFUL_ACCESS_TOKEN
        )

        const secondMigration = migrator.migrationChain.migrations[1]
        await migrator.upgradeTo(secondMigration.id)

        const thirdMigration = migrator.migrationChain.migrations[2]
        await migrator.upgradeTo(thirdMigration.id)

        await migrator.downgradeTo()
        // TODO make some assertions here...

        await cleanSpace(SPACE)

        await sleep(2000)
        const res = await enumerate(SPACE.getContentTypes)
        if (res.length) {
            error('Did not clean up correctly...')
        }
    })
})
