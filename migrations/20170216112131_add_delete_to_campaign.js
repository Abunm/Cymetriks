exports.up = (knex, Promise) =>
  knex.schema.table('offers', t => {
    t.boolean('deleted').defaultTo(false)
  })

exports.down = (knex, Promise) =>
  knex.schema.table('offers', t => {
    t.dropColumn('deleted')
  })
