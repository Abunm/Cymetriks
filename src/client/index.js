import ReactDOM from "react-dom"
import React from "react"
import App from "./app"

import "babel-polyfill"
import "bootstrap/dist/css/bootstrap.min.css"
import "leaflet/dist/leaflet.css"
import "leaflet.icon.glyph"
import "react-select/dist/react-select.css"
import "./styles/reset"

import "./prevent-default-mobile"
import "./fix-leaflet-icon"

const rootEl = document.getElementById("root")
ReactDOM.render(<App />, rootEl)

if (module.hot) {
  module.hot.accept()
}
