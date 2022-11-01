exports.up = (knex, Promise) =>
  knex.schema.table('pros', t => {
    t.enu('gender', ['Male', 'Female'])
    t.string('firstName')
    t.string('lastName')
    t.string('phone')
    t.dropColumn('shopAddress')
    t.string('address')
    t.string('city')
    t.string('category')
  })

exports.down = (knex, Promise) =>
  knex.schema.table('pros', t => {
    t.dropColumn('gender')
    t.dropColumn('firstName')
    t.dropColumn('lastName')
    t.dropColumn('phone')
    t.string('shopAddress')
    t.dropColumn('city')
    t.dropColumn('category')
  })
