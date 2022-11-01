import Bookshelf from '../../bookshelf'
import Offer from './offer'

class Pro extends Bookshelf.Model {
  get tableName() {
    return 'pros'
  }

  get hasTimestamps() {
    return true
  }

  offers() {
    return this.hasMany(Offer, 'proId')
  }
}

export default Pro
