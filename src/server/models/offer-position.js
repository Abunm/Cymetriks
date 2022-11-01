import Bookshelf from '../../bookshelf'
import Offer from './offer'
import User from './user'

class OfferPosition extends Bookshelf.Model {
  get tableName() {
    return 'offer_positions'
  }

  get hasTimestamps() {
    return true
  }

  offer() {
    return this.belongsTo(Offer, 'offerId')
  }

  owner() {
    return this.belongsTo(User, 'owner')
  }
}

export default OfferPosition
