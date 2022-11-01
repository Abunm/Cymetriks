exports.up = (knex, Promise) =>
  knex.schema.table('offers', t => {
    t.boolean('winpts').defaultTo(false)
  })

exports.down = (knex, Promise) =>
  knex.schema.table('offers', t => {
    t.dropColumn('winpts')
  })
