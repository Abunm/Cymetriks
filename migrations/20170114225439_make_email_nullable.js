exports.up = (knex, Promise) =>
  knex.raw('ALTER TABLE users ALTER COLUMN email DROP NOT NULL')

exports.down = (knex, Promise) =>
  knex.raw('ALTER TABLE users ALTER COLUMN email SET NOT NULL')
