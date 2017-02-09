/**
 * revises: 907230f7c
 * id: 55da42387
 * revised_by: c401e90d5
 */

function up (space) {
    return new Promise((res, rej) => {
        space.getContentType('testContentType')
        .then(v => {
            v.fields.push(
                {name: 'testField1', id: 'testField1', type: 'Symbol'}
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
            const index = v.fields.findIndex(v => v.name === 'testField1')
            v.fields[index].omitted = true
            return v.update().then(v => v.publish())
        }).then(v => {
            const index = v.fields.findIndex(v => v.name === 'testField1')
            v.fields[index].deleted = true
            return v.update().then(v => v.publish())
        }).then(res)
    })
}

module.exports = {up, down}
