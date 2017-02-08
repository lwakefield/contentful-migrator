import {ls, randStr} from './util'
import {readFileSync, writeFileSync} from 'fs'

const TEMPLATE = (
`
/**
 * revised_by: null
 * id: <ID>
 * revises: <REVISES>
 */

function up (space) {

}

function down (space) {

}

module.exports = {up, down}
`
)

export function createMigration (path, name = '') {
    const revisionChain = loadRevisionChain(path)
    const revisesId = revisionChain[revisionChain.length - 1]
    const id = randStr(8)
    const src = TEMPLATE
        .replace('<ID>', id)
        .replace('<REVISES>', revisesId)

    const filename = name ?
        `${id}_${name}.js` :
        `${id}.js`
    writeFileSync(`${path}/${filename}`, src)
}

export function loadRevisionChain (path) {
    const paths = ls(`${path}/*.js`)

    const revisionHash = {}
    for (const path of paths) {
        const content = readFileSync(path).toString()
        let [, revised_by] = content.match(/\* revised_by: (\w+)/)
        const [, id] = content.match(/\* id: (\w+)/)
        let [, revises] = content.match(/\* revises: (\w+)/)
        if (revised_by === 'null') revised_by = null
        if (revises === 'null') revises = null

        revisionHash[id] = {revised_by, id, revises}
    }

    // TODO: this could do with some tidying to make sure we don't leave any
    // hanging revisions...

    let node = revisionHash[Object.keys(revisionHash)[0]]
    while (node.revises) node = revisionHash[node.revises]

    let revisionChain = []

    while (node) {
        revisionChain.push(node.id)
        node = revisionHash[node.revised_by]
    }

    return revisionChain
}
