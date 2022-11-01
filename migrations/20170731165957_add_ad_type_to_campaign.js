exports.up = (knex, Promise) =>
  knex.schema.table('offers', t => {
    t.enum('adType', ['video', 'image']).defaultTo('image')
  })

exports.down = function(knex, Promise) {
  knex.schema.table('offers', t => {
    t.dropColumn('adType')
  })
};
