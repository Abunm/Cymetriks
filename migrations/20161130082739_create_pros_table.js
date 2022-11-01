exports.up = (knex, Promise) =>
  knex.schema.createTable('pros', t => {
    t.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'))

    t.string('companyName', 128).notNullable()
    t.string('email', 128).notNullable()
    t.string('zipcode').notNullable()
    t.string('passwordDigest').notNullable()
    t.string('country').notNullable()
    t.string('shopAddress').notNullable()
    t.specificType('shopLocation', 'point').notNullable()

    t.timestamps()

    t.unique('email')
  })

exports.down = (knex, Promise) => knex.schema.dropTable('pros')
