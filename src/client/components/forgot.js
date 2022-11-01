import React, {Component} from 'react'
import {
  Input,
  Button,
  Container,
} from 'reactstrap'
import {css} from 'glamor'
import axios from 'axios'

const styles = {
  container: {
    margin: '100px 0',
  },
  input: {
    margin: '20px 0',
  },
}

class Forgot extends Component {
  state = {
    error: null,
    success: false,
    email: '',
  }


  async sendEmail() {
    const {apiUrl} = this.props
    try {
      await axios.post(apiUrl, {
        email: this.state.email,
      })
      this.setState({success: true})
    } catch (e) {
      if (typeof e.response.data === 'string') {
        this.setState({error: e.response.data})
      }
	  else{
		  this.setState({error: e})
	  }
    }
  }

  render() {
    return (
      <Container {...css(styles.container)}>
        <h2>Mot de passe oublié</h2>
        {
          this.state.success ? (
            <h4>L'email a bien été envoyé</h4>
          ) : (
            <div>
              <Input
                {...css(styles.input)}
                placeholder='Email'
                value={this.state.value}
                onChange={e => this.setState({email: e.target.value})}
              />
              <Button
                onClick={() => this.sendEmail()}
                block
              >
                Envoyer un email
              </Button>
              {
                this.state.error && (
                  <p>{this.state.error}</p>
                )
              }
            </div>
          )
        }
      </Container>
    )
  }
}

export default Forgot
