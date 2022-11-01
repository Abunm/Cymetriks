exports.up = (knex, Promise) =>
  knex("config").insert({
    name: "Temps visibilité user",
    value: "1 hour",
    metric: "Temps",
  })

exports.down = (knex, Promise) =>
  knex("config").where({name: "Temps visibilité user"}).del()
