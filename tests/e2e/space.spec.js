jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000

import Space from '../../src/space'
import {
    spy,
    unspy,
    setupSpace,
    cleanSpace
} from '../util'

let SPACE
let SPACE_ID

beforeAll(async () => {
    [SPACE, SPACE_ID] = await setupSpace()
})
afterEach(async () => {
    await cleanSpace(SPACE)
})

describe('Space', () => {
    it('intializes correctly and fetches a second time', async () => {
        spy(Space.prototype, ['loadMigrationHistory', 'initSpace'])

        let space = await Space.get(
            SPACE_ID,
            process.env.CONTENTFUL_ACCESS_TOKEN
        )
        expect(space.loadMigrationHistory.mock.calls.length).toEqual(1)
        expect(space.initSpace.mock.calls.length).toEqual(1)
        expect(space).toBeTruthy()
        expect(space.space).toBeTruthy()

        space = await Space.get(
            SPACE_ID,
            process.env.CONTENTFUL_ACCESS_TOKEN
        )
        expect(space.loadMigrationHistory.mock.calls.length).toEqual(2)
        expect(space.initSpace.mock.calls.length).toEqual(1)
        expect(space).toBeTruthy()
        expect(space.space).toBeTruthy()

        unspy(Space.prototype, ['loadMigrationHistory', 'initSpace'])
    })
})
