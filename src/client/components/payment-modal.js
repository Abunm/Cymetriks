import React, {Component} from "react"
import {Modal, ModalHeader, ModalBody, Input, Label} from "reactstrap"
import axios from "axios"

import StripeCheckout from "react-stripe-checkout"
import {publicKey as stripePublicKey} from "../../lib/stripe"

class PaymentModal extends Component {
  constructor(props) {
    super(props)
    this.state = {
      balance: 100,
    }
  }

  async componentWillMount() {
    const {data: {offerPrice}} = await axios.get("/payment")
    this.setState({
      offerPrice,
    })
  }

  async onStripeToken(token) {
    try {
      const {data: pro} = await axios.post("/payment", {
        stripeToken: token,
        balance: this.state.balance,
      })
      this.props.updateMe(pro)
    } catch (e) {
      console.log(e)
      window.alert("Une erreur est survenue lors du payement...")
    }

    this.props.setPaymentModalOpen(false)
  }

  render() {
    const {paymentModalOpen, setPaymentModalOpen, email} = this.props

    return (
      <Modal
        isOpen={paymentModalOpen}
        toggle={() => setPaymentModalOpen(!paymentModalOpen)}
      >
        <ModalHeader>Recharger votre compte</ModalHeader>
        <ModalBody>
				<div>
                <h3>Recharger mon compte</h3>
                <Label>Montant à déposer (euros)</Label>
                <Input
                  value={this.state.balance}
                  onChange={e => this.setState({balance: parseInt(e.target.value, 10)})}
                  type="number"
                />
                <StripeCheckout
                  name="WinWin"
                  description={`Recharger votre compte de ${this.state
                    .balance}€`}
                  amount={this.state.balance*100}
                  locale="fr"
                  currency="EUR"
                  token={::this.onStripeToken}
                  stripeKey={stripePublicKey}
                  email={email}
                />
              </div>
        </ModalBody>
      </Modal>
    )
  }
}

export default PaymentModal
