if (!global._babelPolyfill) require('babel-polyfill')

import {ls, randStr, info} from './util'
import {readFileSync, writeFileSync} from 'fs'
import contentful from 'contentful-management'

const TEMPLATE = readFileSync(`${__dirname}/template.js`).toString()
const MIGRATIONS_ID = '__migrations'

export const getClient = accessToken => contentful.createClient({accessToken})
export const getSpace = (spaceId, accessToken) =>
    getClient(accessToken).getSpace(spaceId)

export class Migrator {
    constructor (space, path) {
        this.space = space
        this.path = path
        this.spaceHead = getSpaceHead(space)
        this.migrations = loadRevisionChain(path)
    }
    loadRevision(id) {
        // readFileSync(`${path}/${id}`)
    }
    // Upgrade to and including
    upgrade (revision) {

    }
    downgrade (revision) {
    }
}

export async function paginate(fn, query = {}) {
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

export async function getSpaceHead(space) {
    const page = space.getEntries({
        content_type: MIGRATIONS_ID,
        order: '-sys.createdAt',
        limit: 1
    })
    const items = (page.items || [])
    return items[0] || null
}

export async function getMigrations (space) {
    return await paginate(
        space.getEntries,
        {content_type: MIGRATIONS_ID, order: 'sys.createdAt'}
    )
}

export async function prepareSpace (space) {
    try {
        const migrations = await space.getContentType(MIGRATIONS_ID)
        info(`${MIGRATIONS_ID} content type already exists`)
        return migrations
    } catch (e) {}

    info(`${MIGRATIONS_ID} content type does not exist.`)
    info(`creating ${MIGRATIONS_ID} content type`)


    return await space.createContentTypeWithId(
        MIGRATIONS_ID,
        {name: 'Migrations', fields: [
            {name: 'ref', id: 'ref', type: 'Symbol'}
        ]}
    ).then(v => v.publish())
}

export function createMigration (path, name = '') {
    const revisionChain = loadRevisionChain(path)
    const head = revisionChain[revisionChain.length - 1]
    const id = randStr(8)
    const src = TEMPLATE
        .replace('<ID>', id)
        .replace('<REVISES>', head.id)

    const filename = name ?
        `${path}/${id}_${name}.js` :
        `${path}/${id}.js`

    writeFileSync(filename, src)
    return filename
}

export function loadRevisionChain (dir) {
    const paths = ls(`${dir}/*.js`)

    const revisionHash = {}
    for (const path of paths) {
        const content = readFileSync(path).toString()
        let [, revised_by] = content.match(/\* revised_by: (\w+)/)
        const [, id] = content.match(/\* id: (\w+)/)
        let [, revises] = content.match(/\* revises: (\w+)/)
        if (revised_by === 'null') revised_by = null
        if (revises === 'null') revises = null

        revisionHash[id] = {revised_by, id, revises, path}
    }

    // TODO: this could do with some tidying to make sure we don't leave any
    // hanging revisions...

    let node = revisionHash[Object.keys(revisionHash)[0]]
    while (node.revises) node = revisionHash[node.revises]

    let revisionChain = []

    while (node) {
        revisionChain.push(node)
        node = revisionHash[node.revised_by]
    }

    return revisionChain
}
