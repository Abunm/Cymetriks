exports.up = (knex, Promise) =>
  knex.schema.table('pros', t => {
    t.boolean('validated').defaultTo(false).notNullable()
  })

exports.down = (knex, Promise) =>
  knex.schema.table('pros', t => {
    t.dropColumn('validated')
  })
