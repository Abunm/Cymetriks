exports.up = (knex, Promise) =>
  knex.schema.createTable('config', t => {
    t.string('name').primary()
    t.string('value')
  })

exports.down = (knex, Promise) =>
  knex.schema.dropTable('config')
