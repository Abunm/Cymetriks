exports.up = (knex, Promise) => Promise.all([
  knex.schema.table('users', t => {
    t.integer('winwins')
    t.specificType('lastPosition', 'point')
  }),
  knex.schema.table('offer_positions', t => {
    t.boolean('protected').defaultTo(false)
  })
])

exports.down = (knex, Promise) => Promise.all([
  knex.schema.table('users', t => {
    t.dropColumn('winwins')
    t.dropColumn('lastPosition')
  }),
  knex.schema.table('offer_positions', t => {
    t.dropColumn('protected')
  })
])
