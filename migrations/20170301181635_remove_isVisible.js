exports.up = (knex, Promise) => 
  knex.schema.table('users', t => {
    t.dropColumn('isVisible')
  })

exports.down = function(knex, Promise) {
  knex.schema.table('users', t => {
    t.boolean('isVisible').defaultTo(true)
  })
};
