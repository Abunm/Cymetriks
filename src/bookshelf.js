import knex from "knex"
import bookshelf from "bookshelf"
import dbConfigs from "../knexfile"

const dbConfig = () => {
  if (process.env.NODE_ENV === "test") return dbConfigs.test
  else if (process.env.NODE_ENV === "production") return dbConfigs.production
  else return dbConfigs.development
}

export default bookshelf(knex(dbConfig()))
