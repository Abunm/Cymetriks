exports.up = (knex, Promise) =>
  knex.raw('ALTER TABLE offer_positions ALTER COLUMN owner DROP NOT NULL')

exports.down = (knex, Promise) =>
  knex.raw('ALTER TABLE offer_positions ALTER COLUMN owner SET NOT NULL')
