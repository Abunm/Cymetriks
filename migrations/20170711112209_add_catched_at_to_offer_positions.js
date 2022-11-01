exports.up = (knex, Promise) =>
  knex.schema.alterTable('offer_positions', t => {
    t.dateTime('catched_at')
  })

exports.down = (knex, Promise) =>
  knex.schema.alterTable('offer_positions', t => {
    t.dropColumn('catched_at')
  })
