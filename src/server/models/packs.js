import Bookshelf from '../../bookshelf'

class Packs extends Bookshelf.Model {
  get tableName() {
    return 'packs'
  }

  get hasTimestamps() {
    return false
  }

}

export default Packs
