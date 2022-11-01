exports.up = (knex, Promise) =>
  knex.schema.alterTable('config', t => {
    t.text('value').alter()
  })

exports.down = (knex, Promise) =>
  knex.schema.alterTable('config', t => {
    t.string('value').alter()
  })
