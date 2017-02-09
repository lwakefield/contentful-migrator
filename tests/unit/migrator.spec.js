import {
    loadRevisionChain,
    createMigration
} from '../../src/migrator'
import {ls, cp, rm} from '../../src/util'
import {tmpdir} from 'os'
import fs from 'fs'

const FIXTURE_PATH = `${__dirname}/fixtures`
const TEMPLATE = fs.readFileSync(`${__dirname}/../../src/template.js`).toString()

let migrationsPath = null
beforeEach(() => {
    migrationsPath = `${tmpdir()}/migrator`
    fs.mkdirSync(migrationsPath)
    cp(`${FIXTURE_PATH}/**`, migrationsPath, '-r')
})
afterEach(() => {
    rm(migrationsPath, '-r')
});

// 907230f7c -> 55da42387 -> c401e90d5
// oldest -> newest
describe('loadRevisionChain', () => {
    test('gets the correct chain', () => {
        expect(loadRevisionChain(migrationsPath)).toEqual(
            ['907230f7c', '55da42387', 'c401e90d5']
        )
    })
})

describe('createMigration', () => {
    test('create a new unnamed migration file', () => {
        const migration = createMigration(migrationsPath)
        expect(migration.match(/\w{8}.js$/)).toBeTruthy()
        const [, id] = migration.match(/(\w{8}).js$/)
        const data = fs.readFileSync(migration).toString()
        const expected = TEMPLATE
            .replace('<ID>', id)
            .replace('<REVISES>', 'c401e90d5')
        expect(data).toEqual(expected)
    })
})
