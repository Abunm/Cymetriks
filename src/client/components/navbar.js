import React from "react"
import Navicon from "react-icons/lib/io/navicon"
import {withState, compose} from "recompose"
import {Link} from "react-router"
import {css} from "glamor"
import {Dropdown, DropdownMenu, DropdownItem} from "reactstrap"
import {connect} from "react-redux"
import {bindActionCreators} from "redux"

import {logout} from "../redux/me"

const withOpenState = withState("isOpen", "setIsOpen", false)
const mapState = state => ({user: state.me.user})
const mapDispatch = dispatch => bindActionCreators({logout}, dispatch)

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 10px",
    background: "rgba(255, 255, 255, .9)",
    zIndex: 1000,
  },
  title: {
    fontSize: "24px",
    margin: 0,
    color: "black",
  },
  icon: {
    cursor: "pointer",
  },
}

const Navbar = ({css: _css, logout, isOpen, user, setIsOpen}) =>
  <nav {...css(styles.nav, _css)}>
    <Link to="/pro">
      <h1 {...css(styles.title)}>WinWin Pro</h1>
    </Link>
    {user
      ? <h5 {...css({marginBottom: 0})}>
          {user.companyName}
        </h5>
      : undefined}
    <Dropdown isOpen={isOpen} toggle={() => setIsOpen(!isOpen)}>
      <Navicon
        {...css(styles.icon)}
        onClick={() => setIsOpen(!isOpen)}
        size={24}
      />
      <DropdownMenu right>
        {user
          ? <div>
              <DropdownItem onClick={logout}>Se Déconnecter</DropdownItem>
              <DropdownItem>
                <Link to="/bills">Mes Factures</Link>
              </DropdownItem>
            </div>
          : <DropdownItem>
              <Link to="/">Retour</Link>
            </DropdownItem>}
      </DropdownMenu>
    </Dropdown>
  </nav>

export default compose(connect(mapState, mapDispatch), withOpenState)(Navbar)
