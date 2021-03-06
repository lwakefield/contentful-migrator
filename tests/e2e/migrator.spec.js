jasmine.DEFAULT_TIMEOUT_INTERVAL = 100000

import Migrator from '../../src/migrator'
import {
    cleanSpace,
    setupSpace
} from '../util'

const FIXTURE_PATH = `${__dirname}/../fixtures`
let SPACE
let SPACE_ID

beforeAll(async () => {
    [SPACE, SPACE_ID] = await setupSpace()
})
afterEach(async () => {
    await cleanSpace(SPACE)
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
    })
})
