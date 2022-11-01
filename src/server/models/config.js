import Bookshelf from '../../bookshelf'

class Config extends Bookshelf.Model {
  get tableName() {
    return 'config'
  }

  get hasTimestamps() {
    return false
  }
}

export default Config
