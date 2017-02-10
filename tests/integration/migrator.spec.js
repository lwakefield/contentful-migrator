require('dotenv').config()
jasmine.DEFAULT_TIMEOUT_INTERVAL = 100000;

import contentful from 'contentful-management'

import {
    MIGRATIONS_ID,
    DEFAULT_LOCALE,
    getSpace,
    getSpaceHead,
    paginate,
    Migrator
} from '../../src/migrator'
import {enumerate} from '../../src/space'
import {ls, cp, rm, randStr, info} from '../../src/util'
import {tmpdir} from 'os'
import fs from 'fs'

import {sleep, cleanSpace} from '../util'

const FIXTURE_PATH = `${__dirname}/../fixtures`
const TEMPLATE = fs.readFileSync(`${__dirname}/../../src/template.js`).toString()

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
    it('instantiates correctly', async () => {
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
        console.log('res', res);
    })
    // it('instantiates correctly', () => {
    //     const migrator = new Migrator(space, FIXTURE_PATH)
    //     expect(migrator).toBeTruthy()
    //     expect(migrator.migrations).toMatchSnapshot()
    // })
    // it('loads migrations', () => {
    //     const migrator = new Migrator(space, FIXTURE_PATH)
    //     const firstMigration = migrator.migrations[0]
    //     const migration = migrator.loadMigration(firstMigration.id)
    //     expect(migration).toMatchSnapshot()
    // })
    // it('migrations loaded runs up and down correctly', async () => {
    //     const migrator = new Migrator(space, FIXTURE_PATH)
    //     const firstMigration = migrator.migrations[0]
    //     const migration = migrator.loadMigration(firstMigration.id)

    //     const up = await migration.up(space)
    //     expect(up.sys).toBeTruthy()
    //     expect(up.name).toMatchSnapshot()
    //     expect(up.fields).toMatchSnapshot()

    //     const down = await migration.down(space)
    //     expect(down).toEqual(undefined)
    // })
    // it('runs an upgrade with two migrations', async () => {
    //     const migrator = new Migrator(space, FIXTURE_PATH)
    //     const migration = migrator.migrations[1].id

    //     // TODO we need some real assertions in here...
    //     await migrator.upgradeTo(migration)

    //     await new Promise(res => setTimeout(res, 2000))

    //     await migrator.downgradeTo()
    // })
})
