exports.up = (knex, Promise) =>
  knex.schema.table('pros', t => {
    t.integer('offerCount').defaultTo(100)
  })

exports.down = (knex, Promise) =>
  knex.schema.table('pros', t => {
    t.dropColumn('offerCount')
  })
