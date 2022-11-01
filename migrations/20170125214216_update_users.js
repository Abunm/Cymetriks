exports.up = (knex, Promise) =>
  knex.schema.table('users', t => {
    t.integer('winpoints').defaultTo(0).notNullable()
    t.dropColumn('winwins')
    t.boolean('isVisible').defaultTo(true).notNullable()
    t.integer('level').defaultTo(1).notNullable()
    t.integer('awards').defaultTo(0).notNullable()
    t.integer('distance').defaultTo(0).notNullable()
  })

exports.down = (knex, Promise) =>
  knex.schema.table('users', t => {
    t.integer('winwins')
    t.dropColumn('winpoints')
    t.dropColumn('isVisible')
    t.dropColumn('level')
    t.dropColumn('awards')
    t.dropColumn('distance')
  })
