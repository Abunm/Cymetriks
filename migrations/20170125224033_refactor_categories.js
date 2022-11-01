exports.up = (knex, Promise) =>
  knex.schema.table('categories', t => {
    t.dropColumn('image')
    t.specificType('images', 'text[]')
  })

exports.down = (knex, Promise) =>
  knex.schema.table('categories', t => {
    t.dropColumn('images')
    t.text('image')
  })
