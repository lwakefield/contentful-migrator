require('dotenv').config()
jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;

import {
    MIGRATIONS_ID,
    DEFAULT_LOCALE,
    getSpace,
    getSpaceHead,
    paginate,
    Migrator
} from '../../src/migrator'
import {ls, cp, rm} from '../../src/util'
import {tmpdir} from 'os'
import fs from 'fs'

const FIXTURE_PATH = `${__dirname}/../fixtures`
const TEMPLATE = fs.readFileSync(`${__dirname}/../../src/template.js`).toString()

let space
beforeAll(async () => {
    space = await getSpace(
        process.env.CONTENTFUL_SPACE_ID,
        process.env.CONTENTFUL_ACCESS_TOKEN
    )
})

test('getSpace', async () => {
    const space = await getSpace(
        process.env.CONTENTFUL_SPACE_ID,
        process.env.CONTENTFUL_ACCESS_TOKEN
    )
    expect(space).toBeTruthy()
})

// test('getSpaceHead', async () => {
//     const headEntry = await space.createEntry(MIGRATIONS_ID, {
//         fields: {ref: {[DEFAULT_LOCALE]: 'abc123'}}
//     })
//     expect(headEntry).toBeTruthy()
//     const head = await getSpaceHead(space)
//     expect(head).toEqual('abc123')
//     await headEntry.delete()
// })

describe('Migrator', () => {
    it('instantiates correctly', () => {
        const migrator = new Migrator(space, FIXTURE_PATH)
        expect(migrator).toBeTruthy()
        expect(migrator.migrations).toMatchSnapshot()
    })
    it('loads migrations', () => {
        const migrator = new Migrator(space, FIXTURE_PATH)
        const firstMigration = migrator.migrations[0]
        const migration = migrator.loadMigration(firstMigration.id)
        expect(migration).toMatchSnapshot()
    })
    it('migrations loaded runs up and down correctly', async () => {
        const migrator = new Migrator(space, FIXTURE_PATH)
        const firstMigration = migrator.migrations[0]
        const migration = migrator.loadMigration(firstMigration.id)

        const up = await migration.up(space)
        expect(up.sys).toBeTruthy()
        expect(up.name).toMatchSnapshot()
        expect(up.fields).toMatchSnapshot()

        const down = await migration.down(space)
        expect(down).toEqual(undefined)
    })
    it('runs an upgrade with two migrations', async () => {
        const migrator = new Migrator(space, FIXTURE_PATH)
        const migration = migrator.migrations[1].id

        // TODO we need some real assertions in here...
        await migrator.upgradeTo(migration)

        await new Promise(res => setTimeout(res, 2000))

        await migrator.downgradeTo()
    })
})
