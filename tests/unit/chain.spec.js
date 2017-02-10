import {ls, cp, rm} from '../../src/util'
import {tmpdir} from 'os'
import {mkdirSync, readFileSync} from 'fs'
import fs from 'fs'

import Chain from '../../src/chain'

const TEMPLATE = readFileSync(`${__dirname}/../../src/template.js`).toString()
const MIGRATIONS_DIR = `${tmpdir()}/migrator`

beforeAll(() => {
    mkdirSync(MIGRATIONS_DIR)
})

beforeEach(() => {
    cp(`${__dirname}/../fixtures/**`, MIGRATIONS_DIR, '-r')
})

afterEach(() => {
    rm(`${MIGRATIONS_DIR}/*`, '-r')
})

afterAll(() => {
    rm(MIGRATIONS_DIR, '-r')
})

// 907230f7c -> 55da42387 -> c401e90d5
// oldest -> newest
describe('Chain', () => {
    it('intializes correctly', () => {
        const chain = new Chain(MIGRATIONS_DIR)

        const {migrations} = chain
        expect(migrations[0].revises).toEqual(null)
        expect(migrations[1].revises).toEqual(migrations[0])
        expect(migrations[2].revises).toEqual(migrations[1])

        expect(migrations[0].revisedBy).toEqual(migrations[1])
        expect(migrations[1].revisedBy).toEqual(migrations[2])
        expect(migrations[2].revisedBy).toEqual(null)
    })
    it('creates an unnamed migration', () => {
        const chain = new Chain(MIGRATIONS_DIR)
        const migration = chain.createMigration()
        const {migrations} = chain

        expect(migration).toBeTruthy()
        expect(migrations.length).toEqual(4)
        expect(migrations[3]).toEqual(migration)
        expect(migrations[3].revises).toEqual(migrations[2])
        expect(migrations[2].revisedBy).toEqual(migrations[3])
    })
})
