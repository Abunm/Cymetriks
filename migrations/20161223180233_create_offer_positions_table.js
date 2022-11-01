exports.up = (knex, Promise) =>
  knex.schema.createTable('offer_positions', t => {
    t.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'))

    t.uuid('offerId').references('offers.id').notNullable()
    t.specificType('position', 'point').notNullable()

    t.integer('value')

    t.timestamps()
  })

exports.down = (knex, Promise) => knex.schema.dropTable('offer_positions')
