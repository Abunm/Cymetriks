exports.up = (knex, Promise) =>
  knex.schema.table('offer_positions', t => {
    t.boolean('used').defaultTo(false)
  })

exports.down = (knex, Promise) =>
  knex.schema.table('offer_positions', t => {
    t.dropColumn('used')
  })
