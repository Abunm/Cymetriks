import 'glamor/reset'
import {insertRule} from 'glamor'

insertRule(`html {
  box-sizing: border-box;
}`)

insertRule(`*, *:before, *:after {
  box-sizing: inherit;
}`)

insertRule(`html, body {
  overflow: hidden;
  position: relative;
  height: 100%;
}`)
