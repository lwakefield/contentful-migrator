require('dotenv').config()
jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;

import {ls, cp, rm, randStr} from '../../src/util'
import {tmpdir} from 'os'
import fs from 'fs'
import contentful from 'contentful-management'

import Space from '../../src/space'
import {spy, unspy, cleanSpace} from '../util'

let SPACE
let SPACE_ID
beforeAll(async () => {
    const client = contentful.createClient(
        {accessToken: process.env.CONTENTFUL_ACCESS_TOKEN}
    )
    SPACE = await client.getSpace(process.env.CONTENTFUL_SPACE_ID)
    SPACE_ID = process.env.CONTENTFUL_SPACE_ID
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

        await cleanSpace(SPACE)
    })
})
