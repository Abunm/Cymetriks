exports.up = (knex, Promise) => Promise.all([
  knex.schema.table('offers', t => {
    t.uuid('category').references('categories.id').notNullable()
  }),
  knex.schema.table('offer_positions', t => {
    t.uuid('owner').references('users.id').notNullable()
  })
])

exports.down = (knex, Promise) => Promise.all([
  knex.schema.table('offers', t => {
    t.dropColumn('category')
  }),
  knex.schema.table('offer_positions', t => {
    t.dropColumn('owner')
  })
])

