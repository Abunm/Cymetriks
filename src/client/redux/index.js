import {
  combineReducers,
  createStore,
  applyMiddleware,
  compose,
} from 'redux'
import thunk from 'redux-thunk'

import me from './me'
import mapMode from './map-mode'
import offers from './offers'

const reducer = combineReducers({
  me,
  offers,
  mapMode,
})

const composeEnhancers = process.env.NODE_ENV === 'production' ?
  compose :
  window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

export default () => createStore(
  reducer,
  composeEnhancers(
    applyMiddleware(thunk),
  ),
)
