import React, {Component} from "react"
import {Modal, Button, Col, ModalHeader, ModalBody, Row} from "reactstrap"
import Dropzone from "react-dropzone"
import axios from "axios"
import Ad from "./ad"
import {Div, P} from "glamorous"
import {BounceLoader} from "halogen"

class UploadAdModal extends Component {
  state = {
    file: undefined,
    loadingOpen: false,
  }

  onDrop([file]) {
    this.setState({file})
  }

  async confirm() {
    const data = new FormData()
    data.append("file", this.state.file)
    this.setState({loadingOpen: true})
    await axios.post(`/api/offers/${this.props.initialValues.id}/upload`, data)
    window.location.reload()
  }

  render() {
    return (
      <Modal isOpen={this.props.isOpen} toggle={this.props.toggle}>
        {this.state.loadingOpen &&
          <Div
            position="absolute"
            width="100%"
            height="100%"
            background="rgba(0, 0, 0, .5)"
            zIndex={3000}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Div
              borderRadius={10}
              background="rgba(0, 0, 0, .7)"
              display="flex"
              padding={30}
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
            >
              <BounceLoader color="white" />
              <P color="white" marginTop={30}>
                Upload en cours...
              </P>
            </Div>
          </Div>}
        <ModalHeader>
          <p>Ajouter une publicité</p>
        </ModalHeader>
        <ModalBody>
          <Ad file={this.state.file} initialValues={this.props.initialValues} />
          <Dropzone
            multiple={false}
            onDrop={::this.onDrop}
            style={{
              width: "100%",
              height: 60,
              border: "solid 1px grey",
              borderRadius: 3,
              marginBottom: 10,
              fontSize: 20,
              textAlign: "center",
              position: "relative",
            }}
          >
            <p
              style={{
                transform: "translate(-50%, -50%)",
                top: "50%",
                left: "50%",
                position: "absolute",
              }}
            >
              Glissez déposez ou cliquez pour rajouter une pub...
            </p>
          </Dropzone>
          <Row>
            <Col md={6}>
              <Button color="danger" block onClick={this.props.toggle}>
                Annuler
              </Button>
            </Col>
            <Col md={6}>
              <Button color="primary" block onClick={::this.confirm}>
                Confirmer
              </Button>
            </Col>
          </Row>
        </ModalBody>
      </Modal>
    )
  }
}

export default UploadAdModal
