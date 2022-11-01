import React, {Component} from "react"
import {Input, Button, Container} from "reactstrap"
import {css} from "glamor"
import axios from "axios"

const styles = {
  container: {
    margin: "100px 0",
  },
  input: {
    margin: "20px 0",
  },
}

class Reset extends Component {
  state = {
    error: null,
    password: "",
    confirmPassword: "",
  }

  async resetPassword() {
    const {password, confirmPassword} = this.state
    if (password.length < 3) {
      this.setState({error: "Le mot de passe est trop court"})
      return
    }
    if (password !== confirmPassword) {
      this.setState({error: "Les mots de passe ne correspondent pas"})
      return
    }

    const {key} = this.props.location.query
    const {apiUrl, redirectionUrl} = this.props
    try {
      await axios.post(apiUrl, {
        password,
        key,
      })
      window.location = redirectionUrl
    } catch (e) {
      if (typeof e.response.data === "string") {
        this.setState({error: e.response.data})
      }
    }
  }

  render() {
    return (
      <Container {...css(styles.container)}>
        <h2>Réinitialisation du mot de passe</h2>
        <Input
          {...css(styles.input)}
          placeholder="Nouveau mot de passe"
          value={this.state.password}
          onChange={e => this.setState({password: e.target.value})}
          type="password"
        />
        <Input
          {...css(styles.input)}
          placeholder="Confirmer le nouveau mot de passe"
          value={this.state.confirmPassword}
          onChange={e => this.setState({confirmPassword: e.target.value})}
          type="password"
        />
        <Button block onClick={::this.resetPassword}>
          Réinitialiser
        </Button>
        {this.state.error &&
          <p>
            {this.state.error}
          </p>}
      </Container>
    )
  }
}

export default Reset
