import axios from 'axios'

const FETCH_ME = 'winwin/me/FETCH_ME'
const FETCH_ME_SUCCESS = 'winwin/me/FETCH_ME_SUCCESS'
const FETCH_ME_FAILURE = 'winwin/me/FETCH_ME_FAILURE'
const SET_ME = 'winwin/me/SET_ME'
export const LOGOUT = 'winwin/me/LOGOUT'

const dehydrated = localStorage.getItem('user')
const token = localStorage.getItem('token')

const initialState = dehydrated && token ?
{
  fetching: false,
  user: JSON.parse(dehydrated),
  token,
} : {
  fetching: false,
  user: null,
  token: null,
}

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case FETCH_ME:
      return {...state, fetching: true}
    case SET_ME:
      return {
        ...state,
        fetching: false,
        user: action.payload.user,
        token: action.payload.token,
      }
    case FETCH_ME_SUCCESS:
      return {
        ...state,
        fetching: false,
        user: action.payload,
      }
    case LOGOUT:
      return {
        fetching: false,
        user: null,
        token: null,
      }
    case FETCH_ME_FAILURE:
      return initialState
    default:
      return state
  }
}

export const fetchMe = () => async dispatch => {
  dispatch({type: FETCH_ME})
  try {
    const {data} = await axios.get('/api/pros/me', {withCredentials: true})
    localStorage.setItem('user', JSON.stringify(data))
    dispatch({type: FETCH_ME_SUCCESS, payload: data})
  } catch (err) {
    localStorage.removeItem('user')
    dispatch({type: FETCH_ME_FAILURE})
  }
}

export const logout = () => {
  localStorage.removeItem('user')
  localStorage.removeItem('token')

  return {type: LOGOUT}
}

export const updateMe = me => ({
  type: FETCH_ME_SUCCESS,
  payload: me,
})

export const setMe = (me, token) => {
  localStorage.setItem('user', JSON.stringify(me))
  localStorage.setItem('token', token)
  return {
    type: SET_ME,
    payload: {
      user: me,
      token,
    }
  }
}
