exports.up = (knex, Promise) =>
  knex.schema.createTable('offers', t => {
    t.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'))

    t.uuid('proId').references('pros.id').notNullable()

    t.text('product')
    t.text('condition')

    t.integer('duration')

    t.timestamps()
  })

exports.down = (knex, Promise) => knex.schema.dropTable('offers')
