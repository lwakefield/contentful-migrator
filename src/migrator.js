if (!global._babelPolyfill) require('babel-polyfill')

import {readFileSync, writeFileSync} from 'fs'
import contentful from 'contentful-management'

import {ls, randStr, info} from './util'
import Space from './space'
import MigrationChain from './chain'
import {MIGRATIONS_ID, DEFAULT_LOCALE, TEMPLATE_STR} from './constants'

// TODO: terminology, define the difference b/w a migration and a revision
export class Migrator {
    constructor (space, migrationChain) {
        this.space = space
        this.migrationChain = migrationChain
    }

    static async get(spaceId, dir, accessToken) {
        const space = await Space.get(spaceId, accessToken)
        const migrationChain = new MigrationChain(dir)
        return new Migrator(space, migrationChain)
    }

    // Upgrade to and including
    // TODO: how do you handle a migration failing half way?
    async upgradeTo(revisionId) {
        const remoteHeadRef = this.space.getHeadRef()
        info(`Remote head is at ${remoteHeadRef}`)

        // Get the next migration to run
        let migration = !remoteHeadRef ?
            this.migrationChain.first() :
            this.migrationChain.find(remoteHeadRef).revisedBy

        // TODO: if head is past revisionId, then it will run ALL migrations

        let isDone = !migration
        while (!isDone) {
            info(`running upgrade: ${migration.id}`)
            await migration.up(this.space.space)
            await this.space.addHead(migration.id)
            isDone = migration.id === revisionId || !migration.revisedBy
            migration = migration.revisedBy
        }
    }

    // Downgrade to and including, this means the head will be set to the
    // migration prior to revisionId
    async downgradeTo (revisionId) {
        const remoteHeadRef = this.space.getHeadRef()
        info(`Remote head is at ${remoteHeadRef}`)

        // Get the next migration to run
        let migration = !remoteHeadRef ?
            this.migrationChain.last() :
            this.migrationChain.find(remoteHeadRef)

        let isDone = !migration
        while (!isDone) {
            info(`running downgrade: ${migration.id}`)
            await migration.down(this.space.space)
            await this.space.deleteHead()
            isDone = migration.id === revisionId || !migration.revises
            migration = migration.revises
        }


//         const migrationHistory = await getMigrationHistory(this.space)
//         const getId = entry => entry.fields.ref[DEFAULT_LOCALE]

//         let head = migrationHistory[0]

//         const firstIndex = this.getMigrationIndex(getId(head))
//         const lastIndex = this.getMigrationIndex(revisionId) || 0

//         for (let i = firstIndex; i >= lastIndex; i--) {
//             const id = this.migrations[i].id
//             info(`running downgrade: ${id}`)
//             const migration = this.loadMigration(id)
//             await migration.down(this.space)

//             head = migrationHistory.shift()
//             await head.delete()
//         }
    }

}
