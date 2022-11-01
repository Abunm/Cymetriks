exports.up = (knex, Promise) =>
  knex.schema.createTable('bills', t => {
    t.integer('id').primary()

    t.uuid('proId')
    t.integer('nbOffers')
    t.integer('price')
    t.float('tax')

    t.timestamps()
  }).then(() => knex('config').insert([
    {name: 'TVA', value: '0.2', metric: '/1'},
    {name: 'Addresse de la société', value: '2NL, 38 QUAI DU PETIT PARC, 94100 SAINT MAUR DES FOSSES'}
  ]))

exports.down = (knex, Promise) =>
  Promise.all([
    knex('config').where('name', 'TVA').del(),
    knex('config').where('name', 'Addresse de la société').del(),
  ]).then(() => knex.schema.dropTable('bills'))
