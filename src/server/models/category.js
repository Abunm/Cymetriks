import Bookshelf from '../../bookshelf'
import Offer from './offer'

class Category extends Bookshelf.Model {
  get tableName() {
    return 'categories'
  }

  get hasTimestamps() {
    return false
  }

  offers() {
    return this.hasMany(Offer, 'category')
  }
}

export default Category
