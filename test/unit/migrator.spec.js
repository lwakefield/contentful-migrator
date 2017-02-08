import {
    loadRevisionChain,
    createMigration
} from '../../src/migrator'

// 907230f7c -> 55da42387 -> c401e90d5
// oldest -> newest
describe('loadRevisionChain', () => {
    it('gets the correct chain', () => {
        expect(loadRevisionChain(`${__dirname}/fixtures`)).toEqual(
            ['907230f7c', '55da42387', 'c401e90d5']
        )
    })
})

describe('createMigration', () => {
    it('create a new unnamed migration file', () => {
        createMigration(`${__dirname}/fixtures`)
    })
})
