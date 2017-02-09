import {
    loadRevisionChain,
    createMigration,
    prepareSpace,
    getMigrations,
} from '../../src/migrator'
import {ls, cp, rm} from '../../src/util'
import {tmpdir} from 'os'
import fs from 'fs'

const FIXTURE_PATH = `${__dirname}/../fixtures`
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
        expect(loadRevisionChain(migrationsPath)).toMatchSnapshot()
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

describe('prepareSpace', () => {
    // If a contentType doesn't exist we get a 404
    // Otherwise response looks as follows:
    // const response = {
    //     name: 'Migrations',
    //     fields: [
    //         {
    //             name: 'ref',
    //             id: 'ref',
    //             type: 'Symbol',
    //             localized: false,
    //             required: false,
    //             disabled: false,
    //             omitted: false,
    //             validations: []
    //         }
    //     ],
    //     sys: {
    //         id: '__migrations',
    //         type: 'ContentType',
    //         version: 1,
    //         createdAt: '2017-02-09T16:44:39.326Z',
    //         createdBy: { sys: [Object] },
    //         space: { sys: [Object] },
    //         updatedAt: '2017-02-09T16:44:39.326Z',
    //         updatedBy: { sys: [Object] }
    //     }
    // }
    it('creates the __migrations table the first time', async () => {
        const getContentType = jest.fn(Promise.reject)
        const publish = jest.fn(() => Promise.resolve({}))
        const createContentTypeWithId = jest.fn(
            () => Promise.resolve({publish})
        )
        const migrations = await prepareSpace({
            getContentType, createContentTypeWithId
        })
        expect(migrations).toEqual({})
        expect(getContentType.mock.calls.length).toEqual(1)
        expect(createContentTypeWithId.mock.calls.length).toEqual(1)
        expect(publish.mock.calls.length).toEqual(1)
    })

    it('fetches the __migrations table the second time', async () => {
        const getContentType = jest.fn(() => Promise.resolve({}))
        const createContentTypeWithId = jest.fn()
        const migrations = await prepareSpace({
            getContentType, createContentTypeWithId
        })
        expect(migrations).toEqual({})
        expect(getContentType.mock.calls.length).toEqual(1)
        expect(createContentTypeWithId.mock.calls.length).toEqual(0)
    })
})

describe('getMigrations', () => {
        // const page = await fn({skip: entries.length, limit})
        // const items = page.items || []
    it('fetches all migrations', async () => {
        const getEntries = jest.fn()
            .mockReturnValueOnce(Promise.resolve({items: [1, 2, 3]}))
            .mockReturnValueOnce(Promise.resolve({items: [4, 5, 6]}))
            .mockReturnValueOnce(Promise.resolve({items: []}))
        const migrationContentType = {getEntries}
        const migrations = await getMigrations(migrationContentType)
        expect(migrations).toEqual([1, 2, 3, 4, 5, 6])
    })
})
