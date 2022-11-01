exports.up = (knex, Promise) =>
  Promise.all([
    knex.raw(
      "ALTER TABLE offer_positions ADD CONSTRAINT check_positive CHECK (value >= 0)",
    ),
    knex.raw(
      "ALTER TABLE users ADD CONSTRAINT check_positive CHECK (winpoints >= 0)",
    ),
  ])

exports.down = (knex, Promise) =>
  Promise.all([
    knex.raw("ALTER TABLE offer_positions DROP CONSTRAINT check_positive"),
    knex.raw("ALTER TABLE users DROP CONSTRAINT check_positive"),
  ])
