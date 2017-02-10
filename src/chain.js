import {ls, arrayToObj, randStr} from './util'
import {readFileSync, writeFileSync} from 'fs'

const TEMPLATE = readFileSync(`${__dirname}/template.js`).toString()

export default class MigrationChain {
    constructor (dir) {
        this.dir = dir
        this.load()
        this.link()
    }
    load () {
        const paths = ls(`${this.dir}/*.js`)
        const migrations = paths.map(v => new Migration(v))

        const migrationMap = arrayToObj(
            migrations,
            (val) => ({[val.id]: val})
        )

        // Backtrack to find the first migration
        let migration = migrations[0]
        while (migration.revisesId) migration = migrationMap[migration.revisesId]

        this.migrations = []
        while (migration) {
            this.migrations.push(migration)
            migration = migrationMap[migration.revisedById]
        }
    }
    link () {
        for (let i = 1; i < this.migrations.length; i++) {
            const [a, b] = [this.migrations[i - 1], this.migrations[i]]
            a.revisedBy = b
            b.revises = a
        }
    }
    createMigration (name) {
        const head = this.migrations[this.migrations.length - 1]
        const headId = head ? head.id : 'null'
        const id = randStr(8)
        const filename = name ?
            `${this.dir}/${id}_${name}.js` :
            `${this.dir}/${id}.js`

        const src = TEMPLATE
            .replace('<ID>', id)
            .replace('<REVISES>', headId)

        writeFileSync(filename, src)

        const migration = new Migration(filename)
        this.migrations.push(migration)
        this.link()
        return migration
    }
    first () {
        return this.migrations[0] || null
    }
    find (id) {
        return this.migrations.find(v => v.id === id) || null
    }
}

export class Migration {
    constructor (path) {
        this.path = path
        this.revises = null
        this.revisedBy = null
        this.load()
    }

    load () {
        const content = readFileSync(this.path).toString()
        const [, revisedByMatch] = content.match(/\* revised_by: (\w+)/)
        const [, idMatch]        = content.match(/\* id: (\w+)/)
        const [, revisesMatch]   = content.match(/\* revises: (\w+)/)

        const isNully = v => !v || v === 'null'

        this.revisedById = isNully(revisedByMatch) ? null: revisedByMatch
        this.id          = isNully(idMatch) ? null: idMatch
        this.revisesId   = isNully(revisesMatch) ? null: revisesMatch
    }

    runUp (space) {
        return require(this.path).up(space)
    }
}
