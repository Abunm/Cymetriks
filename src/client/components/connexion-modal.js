import React from "react"
import _ from "lodash"
import {Link} from "react-router"
import {css} from "glamor"
import {Modal, ModalHeader, ModalBody, Button} from "reactstrap"

const styles = {
  buttons: css({
    textAlign: "center",
    "& > *:first-child": {
      marginRight: 10,
    },
  }),
}

const ConnexionModal = ({user}) =>
  <Modal isOpen={!user} toggle={_.noop}>
    <ModalHeader>Connexion Requise</ModalHeader>
    <ModalBody>
      <p>La connexion est requise pour utiliser les fonctionnalités...</p>
      <div {...styles.buttons}>
        <Link to="/register">
          <Button color="primary">S&apos;inscrire</Button>
        </Link>
        <Link to="/login">
          <Button color="success">Se connecter</Button>
        </Link>
      </div>
    </ModalBody>
  </Modal>

export default ConnexionModal
