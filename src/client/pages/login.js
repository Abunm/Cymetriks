import React from "react"
import {Redirect} from "react-router"
import {Container} from "reactstrap"
import {bindActionCreators} from "redux"
import {connect} from "react-redux"
import {css} from "glamor"
import {Link} from "react-router"

import {forLogin} from "../../types/pro"
import Form from "../components/form"
import {setMe} from "../redux/me"
import {setOffers} from "../redux/offers"

const styles = {
  container: {
    margin: "100px 0",
  },
  title: {
    marginBottom: 20,
  },
}

const mapState = state => ({
  user: state.me.user,
})
const mapDispatch = dispatch => bindActionCreators({setMe, setOffers}, dispatch)

const onSuccess = (setMe, setOffers) => res => {
  const pro = res.data
  const {token, offers, ...me} = pro
  setMe(me, token)
  setOffers(offers)
}

const LoginPage = ({user, setMe, setOffers}) =>
  user
    ? <Redirect to="/pro" />
    : <Form
        schema={forLogin}
        url="/api/auth/pro"
        onSuccess={onSuccess(setMe, setOffers)}
      >
        {(Input, Submit) =>
          <Container {...css(styles.container)}>
            <h1 {...css(styles.title)}>Se Connecter</h1>
            <div>
              <Input for="email" placeholder="Email" />
              <Input for="password" placeholder="Mot de passe" />
              <Submit color="success" block>
                Se connecter
              </Submit>
            </div>
            <Link to="/forgot">Mot de passe oublié</Link>
          </Container>}
      </Form>

export default connect(mapState, mapDispatch)(LoginPage)
