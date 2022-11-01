import {LOGOUT} from './me'

const SET_OFFERS = 'winwin/offers/ADD_OFFERS'

export default function offers(state = [], action = {}) {
  switch (action.type) {
    case SET_OFFERS:
      return action.payload
    case LOGOUT:
      return []
    default:
      return state
  }
}

export const setOffers = (offers) => ({
  type: SET_OFFERS,
  payload: [...offers],
})
