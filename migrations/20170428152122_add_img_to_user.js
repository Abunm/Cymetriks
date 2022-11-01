exports.up = (knex, Promise) =>
  knex.schema.table('users', t => {
    t.integer('image').defaultTo(0).notNullable()
  })

exports.down = (knex, Promise) =>
  knex.schema.table('users', t => {
    t.dropColumn('image')
  })
