import React from 'react'

import axios from 'axios'

import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from 'reactstrap'

function doDelete(url, toggle) {
  return async () => {
    await axios.delete(url)
    toggle()
  }
}

const DeleteModal = ({
  toggle,
  isOpen,
  deleteUrl,
  sentence,
}) => (
  <Modal isOpen={isOpen} toggle={toggle}>
    <ModalHeader>
      Suppression
    </ModalHeader>
    <ModalBody>
      {sentence}
    </ModalBody>
    <ModalFooter>
      <Button onClick={toggle}>Annuler</Button>
      <Button color='danger' onClick={doDelete(deleteUrl, toggle)}>
        Supprimer
      </Button>
    </ModalFooter>
  </Modal>
)

export default DeleteModal
