import React, {Component} from "react"
import {
  Modal,
  ModalHeader,
  ModalBody,
  Label,
  Input,
  Button,
  FormFeedback,
} from "reactstrap"
import axios from "axios"

class CreateWinpointsModal extends Component {
  constructor(...props) {
    super(...props)
    this.state = {
      value: "",
      invalid: false,
	  wNumber: "1",
    }
  }

  async submit() {
    const value = parseInt(this.state.value, 10)
	const nb = parseInt(this.state.wNumber, 10)
    if (`${value}` !== this.state.value || `${nb}` !== this.state.wNumber) {
      this.setState({invalid: true})
      return
    }

    this.setState({invalid: false})
    const body = {
      category: "265d4d46-b9c6-4bc7-8abd-56a0d0eeb5a2",
      image:
        "https://raw.githubusercontent.com/lucienboillod/emoji-winpts/master/winpts.png",
      label: `${value} WinPoints`,
      winpts: true,
	  offerCount: nb,
    }
    try {
      await axios.post("/api/offers", body)
      this.props.toggle()
    } catch (e) {
      console.log(e)
    }
  }

  render() {
    if (!this.props.isOpen) {
      return <div />
    }

    return (
      <Modal isOpen={this.props.isOpen} toggle={this.props.toggle}>
        <ModalHeader>Ajouter une campagne WinPoints</ModalHeader>
        <ModalBody>
          <Label>Valeur en WinPoints</Label>
          <Input
            value={this.state.value}
            onChange={e => this.setState({value: e.target.value})}
            placeholder="Valeur"
          />
          {this.state.invalid
            ? <FormFeedback>Merci de rentrer un nombre</FormFeedback>
            : undefined}
			<p>Nombres d'offres à placer</p>
			<Input onChange={(v) => this.setState({wNumber: v.target.value})} value={this.state.wNumber} min="0"/>
          <Button
            block
            style={{
              marginTop: 10,
            }}
            onClick={::this.submit}
          >
            Valider
          </Button>
        </ModalBody>
      </Modal>
    )
  }
}

export default CreateWinpointsModal
