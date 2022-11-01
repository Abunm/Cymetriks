exports.up = (knex, Promise) =>
  knex.raw('create extension if not exists "uuid-ossp"')

exports.down = (knex, Promise) =>
  knex.raw('drop extension if exists "uuid-ossp"')
