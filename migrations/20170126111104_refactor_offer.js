exports.up = (knex, Promise) =>
  knex.schema.table('offers', t => {
    t.dropColumn('category')
    t.dropColumn('product')
    t.dropColumn('condition')
    t.dropColumn('duration')
  }).then(() => knex.schema.table('offers', t => {
    t.string('category')
    t.string('image')
    t.text('label')
    t.dateTime('until')
  }))

exports.down = (knex, Promise) =>
  knex.schema.table('offers', t => {
    t.dropColumn('category')
    t.dropColumn('image')
    t.dropColumn('label')
    t.dropColumn('until')
  }).then(() => knex.schema.table('offers', t => {
    t.uuid('category').references('categories.id').notNullable()
    t.string('product')
    t.string('condition')
    t.integer('duration')
  }))
