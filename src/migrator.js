if (!global._babelPolyfill) require('babel-polyfill')

import MigrationChain from './chain'
import Space from './space'
import {info} from './util'

export default class Migrator {
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
    }

}
