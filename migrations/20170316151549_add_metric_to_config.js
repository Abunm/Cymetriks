exports.up = (knex, Promise) =>
  knex.schema.table('config', t => {
    t.string('metric');
  })

exports.down = (knex, Promise) =>
  knex.schema.table('config', t => {
    t.dropColumn('metric')
  })
