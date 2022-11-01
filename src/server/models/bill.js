import Bookshelf from '../../bookshelf'
import Pro from './pro'

class Bill extends Bookshelf.Model {
  get tableName() {
    return 'bills'
  }

  get hasTimestamps() {
    return true
  }

  pro() {
    return this.belongsTo(Pro, 'proId')
  }
}

export default Bill
