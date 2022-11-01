exports.up = (knex, Promise) =>
  knex.schema.table('users', t => {
    t.dropColumn('distance')
  }).then(() => knex.schema.table('users', t => {
    t.float('distance')
  }))

exports.down = (knex, Promise) =>
  knex.schema.table('users', t => {
    t.dropColumn('distance')
  }).then(() => knex.schema.table('users', t => {
    t.integer('distance')
  }))
