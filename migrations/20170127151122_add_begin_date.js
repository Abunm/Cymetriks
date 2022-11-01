exports.up = (knex, Promise) =>
  knex.schema.table('offers', t => {
    t.dateTime('since')
  })

exports.down = (knex, Promise) =>
  knex.schema.table('offers', t => {
    t.dropColumn('since')
  })
