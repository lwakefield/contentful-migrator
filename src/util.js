const {execSync} = require('child_process')
const crypto = require('crypto')

export const ls = path => execSync(`ls ${path}`).toString()
    .split('\n').filter(v => !!v)
export const randStr = len => crypto.randomBytes(len).toString('hex')

// function createMigration (name) {
//     const id = randStr(8)
//     const template = (
// `
// /*
//  * revised_by: ${}
//  * id: ${id}
//  * revises: ${}
//  */

// function up (space) {

// }
// function down (space) {
// }
// `
//     )
// }

// const randStr (len) => crypto.randomBytes(len).toString('hex')

// module.exports = createMigration

