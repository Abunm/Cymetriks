import Bookshelf from '../../bookshelf'

import Pro from './pro'
import OfferPosition from './offer-position'
import Category from './category'

class Offer extends Bookshelf.Model {
  get tableName() {
    return 'offers'
  }

  get hasTimestamps() {
    return true
  }

  pro() {
    return this.belongsTo(Pro, 'proId')
  }

  positions() {
    return this.hasMany(OfferPosition, 'offerId')
  }

  category() {
    return this.belongsTo(Category, 'category')
  }
}

export default Offer
