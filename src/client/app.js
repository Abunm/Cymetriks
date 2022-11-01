import React from "react"
import {Provider} from "react-redux"
import {BrowserRouter, Match} from "react-router"
import axios from "axios"
import {css} from "glamor"

import createStore from "./redux"
import {fetchMe} from "./redux/me"

import {navBarHeight} from "./styles/constants"
import Navbar from "./components/navbar"

import Map from "./pages/map"
import Register from "./pages/register"
import Login from "./pages/login"
import Admin from "./pages/admin"
import Forgot from "./pages/forgot"
import Reset from "./pages/reset"
import ForgotUser from "./pages/forgotUser"
import ResetUser from "./pages/resetUser"
import Bills from "./pages/bills"
import BillDetail from "./pages/bill-detail"

const store = createStore()

axios.interceptors.request.use(config => {
  const state = store.getState()
  const {token} = state.me
  if (token) {
    config.headers.Authorization = "Bearer " + token
  }
  return config
})

store.dispatch(fetchMe())

const styles = {
  nav: {
    position: "fixed",
    width: "100vw",
    height: navBarHeight,
  },
  content: {
    minHeight: `calc(100vh - ${navBarHeight}px)`,
    background: "#f7f7f9",
    paddingTop: navBarHeight,
  },
}

function withPage(Component) {
  return ({...props}) =>
    <div>
      <Navbar css={styles.nav} />
      <div {...css(styles.content)}>
        <Component {...props} style={{overflow: "hidden"}} />
      </div>
    </div>
}

export default () =>
  <Provider store={store}>
    <BrowserRouter>
      <div>
        <Match exactly pattern="/pro" component={withPage(Map)} />
        <Match exactly pattern="/login" component={withPage(Login)} />
        <Match exactly pattern="/register" component={withPage(Register)} />
        <Match exactly pattern="/forgot" component={withPage(Forgot)} />
        <Match exactly pattern="/reset" component={withPage(Reset)} />
        <Match exactly pattern="/forgotUser" component={withPage(ForgotUser)} />
        <Match exactly pattern="/resetUser" component={withPage(ResetUser)} />
        <Match exactly pattern="/bills" component={withPage(Bills)} />
        <Match pattern="/admin" component={Admin} />
        <Match exactly pattern="/billDetail/:id" component={BillDetail} />
      </div>
    </BrowserRouter>
  </Provider>
