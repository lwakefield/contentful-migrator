/**
 * revises: null
 * id: 907230f7c
 * revised_by: 55da42387
 */

function up (space) {
    return new Promise((res, rej) => {
        space.createContentTypeWithId(
            'testContentType',
            {name: 'testContentType', fields: [
                {name: 'testField', id: 'testField', type: 'Symbol'}
            ]}
        )
        .then(v => v.publish())
        .then(res)
    })
}

function down (space) {
    return new Promise((res, rej) => {
        space.getContentType('testContentType')
        .then(v => v.unpublish())
        .then(v => v.delete())
        .then(res)
    })
}

module.exports = {up, down}
