const NORMAL = 'winwin/map-model/NORMAL'
const PUT_OFFERS = 'winwin/map-mode/PUT_OFFERS'
const LIST_OFFERS = 'winwin/map-mode/LIST_OFFERS'
const ADD_MARKER = 'winwin/map-mode/ADD_MARKER'
const REMOVE_MARKER = 'winwin/map-mode/REMOVE_MARKER'

const initialState = {
  mode: 'normal'
}

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case NORMAL:
      return {
        mode: 'normal'
      }
    case PUT_OFFERS:
      return {
        mode: 'put_offers',
        offer: action.payload.offer,
        markers: action.payload.markers,
        diff: 0,
      }
    case LIST_OFFERS:
      return {
        mode: 'list_offers',
        campaign: action.payload.campaign,
        offers: action.payload.offers,
      }
    case REMOVE_MARKER:
      return {
        ...state,
        markers: [
          ...state.markers.slice(0, action.payload),
          ...state.markers.slice(action.payload + 1),
        ],
        diff: state.diff,
      }
    case ADD_MARKER:
      const {lat, lng} = action.payload
      return {
        ...state,
        markers: [...state.markers, [lat, lng]],
      }
    default:
      return state
  }
}

export const setNormal = () => ({type: NORMAL})
export const setPutOffers = (offer, markers = []) => ({
  type: PUT_OFFERS,
  payload: {offer, markers}
})
export const setListOffers = (campaign, offers = []) => ({
  type: LIST_OFFERS,
  payload: {campaign, offers}
})
export const addMarker = latlng => ({
  type: ADD_MARKER,
  payload: latlng,
})
export const removeMarker = index => ({
  type: REMOVE_MARKER,
  payload: index,
})
