/**
 * revised_by: null
 * revises: 55da42387
 * id: c401e90d5
 */

function up (space) {
    return new Promise((res, rej) => {
        space.getContentType('testContentType')
        .then(v => {
            v.fields.push(
                {name: 'testField2', id: 'testField2', type: 'Symbol'}
            )
            return v.update()
        })
        .then(v => v.publish())
        .then(res)
    })
}

function down (space) {
    return new Promise((res, rej) => {
        space.getContentType('testContentType')
        .then(v => {
            const index = v.fields.findIndex(v => v.name === 'testField2')
            v.fields[index].omitted = true
            return v.update().then(v => v.publish())
        }).then(v => {
            const index = v.fields.findIndex(v => v.name === 'testField2')
            v.fields[index].deleted = true
            return v.update().then(v => v.publish())
        }).then(res)
    })
}

module.exports = {up, down}
