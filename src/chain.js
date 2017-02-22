import {ls, arrayToObj, randStr} from './util'
import {readFileSync, writeFileSync} from 'fs'
import {TEMPLATE_STR} from './constants'

export default class MigrationChain {
    constructor (dir) {
        this.dir = dir
        this.load()
        this.link()
    }
    load () {
        const paths = ls(`${this.dir}/*.js`)
        const migrations = paths.map(v => new Migration(v)).filter(v => !!v.id)

        if (!migrations.length) {
            this.migrations = []
            return
        }

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

        const src = TEMPLATE_STR
            .replace('<ID>', id)
            .replace('<REVISES>', headId)

        writeFileSync(filename, src)

        // Update the old head to reference the new head
        if (head) {
            const headContent = readFileSync(head.path).toString()
            writeFileSync(
                head.path,
                headContent.replace('revised_by: null', `revised_by: ${id}`)
            )
        }

        const migration = new Migration(filename)
        this.migrations.push(migration)
        this.link()
        return migration
    }
    first () {
        return this.migrations[0] || null
    }
    last () {
        return this.migrations[this.migrations.length - 1] || null
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
        const [, idMatch]        = content.match(/\* id: (\w+)/) || []
        const [, revisedByMatch] = content.match(/\* revised_by: (\w+)/) || []
        const [, revisesMatch]   = content.match(/\* revises: (\w+)/) || []

        const isNully = v => !v || v === 'null'

        this.revisedById = isNully(revisedByMatch) ? null: revisedByMatch
        this.id          = isNully(idMatch) ? null: idMatch
        this.revisesId   = isNully(revisesMatch) ? null: revisesMatch
    }

    up (space) {
        return require(this.path).up(space)
    }

    down (space) {
        return require(this.path).down(space)
    }
}
