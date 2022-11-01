exports.up = (knex, Promise) =>
  knex.schema.createTable('categories', t => {
    t.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'))

    t.string('name').unique().notNullable()
    t.string('image').notNullable()

    t.timestamps()
  })

exports.down = (knex, Promise) => knex.schema.dropTable('categories')
