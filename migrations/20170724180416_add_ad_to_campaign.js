exports.up = (knex, Promise) =>
  knex.schema.table('offers', t => {
    t.string('ad')
  })

exports.down = (knex, Promise) =>
  knex.schema.table('offers', t => {
    t.dropColumn('ad')
  })
