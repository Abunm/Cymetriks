exports.up = (knex, Promise) =>
  knex.schema.table('offers', t => {
    t.integer('code')
  })

exports.down = (knex, Promise) =>
  knex.schema.table('offers', t => {
    t.dropColumn('code')
  })
