exports.up = (knex, Promise) =>
  knex.schema.createTable('users', t => {
    t.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'))

    t.string('fbId').unique()
    t.string('goId').unique()
    t.string('email').notNullable().unique()

    t.string('username').unique()
    t.string('passwordDigest')

    t.timestamps()
  })

exports.down = (knex, Promise) => knex.schema.dropTable('users')
