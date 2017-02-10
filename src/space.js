import contentful from 'contentful-management'

import {
    MIGRATIONS_ID,
    DEFAULT_LOCALE
} from './constants'
import {info} from './util'

export default class Space {
    constructor (space) {
        this.space = space
        this.migrations = []
    }
    static async get (id, accessToken) {
        const _space = await contentful.createClient({accessToken}).getSpace(id)
        const space = new Space(_space)

        try {
            await space.loadMigrationHistory()
        } catch (e) {
            info(`${MIGRATIONS_ID} content type does not exist`)
            info(`creating ${MIGRATIONS_ID} content type`)
            await space.initSpace()
        }

        return space
    }

    async loadMigrationHistory () {
        this.migrations = await enumerate(
            this.space.getEntries,
            {content_type: MIGRATIONS_ID, order: 'sys.createdAt'}
        )
    }

    async initSpace () {
        const contentType = await this.space.createContentTypeWithId(
            MIGRATIONS_ID,
            {name: 'Migrations', fields: [
                {name: 'ref', id: 'ref', type: 'Symbol'}
            ]}
        )
        await contentType.publish()
    }

    async addHead (id) {
        const migration = await this.space.createEntry(
            MIGRATIONS_ID,
            {fields: {ref: {[DEFAULT_LOCALE]: id}}}
        )
        this.migrations.push(migration)
    }

    async deleteHead () {
        const head = this.migrations.shift()
        await head.delete()
    }

    getHeadRef () {
        const last = this.migrations[this.migrations.length - 1]
        return last ? last.fields.ref[DEFAULT_LOCALE] : null
    }
}

export async function enumerate (fn, query = {}) {
    const limit = 1000
    const entries = []
    let isDone = false
    while (!isDone) {
        const page = await fn({...query, skip: entries.length, limit})
        const items = page.items || []
        entries.push(...items)
        isDone = !items.length
    }
    return entries
}
