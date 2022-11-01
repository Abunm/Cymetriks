import React, {Component} from "react"
import {
  Col,
  Container,
  Navbar,
  NavbarBrand,
  Input,
  Button,
  Table,
  Row,
  Modal,
  ModalHeader,
  ModalBody,
  Alert,
} from "reactstrap"
import {Link, Match} from "react-router"
import {css} from "glamor"
import axios from "axios"

import emojis from "../../emoji.json"
import emoji2base64 from "../../emoji2base64.json"

const emojiImages = Object.values(emojis)
  .map(emoji => emoji.unicode)
  .map(
    unicode =>
      `https://raw.githubusercontent.com/Ranks/emojione-assets/master/png/64/${unicode}.png`,
  )

const styles = {
  navbar: css({
    background: "#a03830",
    color: "white",
  }),
  list: css({
    height: "calc(100% - 54px)",
    background: "#eee",
  }),
  link: css({
    width: "calc(100% + 30px)",
    height: 50,
    margin: "0 -15px",
    padding: 10,
    ":hover": {
      background: "rgba(0, 0, 0, .1)",
    },
  }),
  scrollable: css({
    height: "calc(100% - 54px)",
    overflow: "auto",
    paddingBottom: 20,
  }),
}

class Config extends Component {
  constructor(...props) {
    super(...props)
    this.state = {
      configs: [],
	  packsConf: [],
    }
  }

  async componentWillMount() {
    const {data} = await axios.get("/admin/api/config")
	const res = await axios.get("/payment/Packs")
    this.setState({configs: data, packsConf: res.data})
  }
  

  onChange(name) {
    return e => {
      const newValue = e.target.value
      const index = this.state.configs.findIndex(e => e.name === name)
      const newConfigs = Object.assign([], this.state.configs, {
        [index]: {
          ...this.state.configs[index],
          value: newValue,
        },
      })
      this.setState({configs: newConfigs})
    }
  }
  
  onChangePack(id) {
    return e => {
      const newValue = e.target.value
      const index = this.state.packsConf.findIndex(e => e.id === id)
      const newPacks = Object.assign([], this.state.packsConf, {
        [index]: {
          ...this.state.packsConf[index],
          price: newValue,
        },
      })
      this.setState({packsConf: newPacks})
    }
  }

  onSubmit(name) {
    return async () => {
      const index = this.state.configs.findIndex(e => e.name === name)
      const value = this.state.configs[index].value
      const {data} = await axios.put("/admin/api/config", {name, value})
      const configs = {}
      data.forEach(({name, value}) => (configs[name] = value))
      this.setState({configs})
    }
  }
  
  onSubmitPacks(id) {
    return async () => {
      const index = this.state.packsConf.findIndex(e => e.id === id)
      const value = this.state.packsConf[index].price
      const {data} = await axios.put("/payment/Packs", {id, value})
      const packsConf = {}
      data.forEach(({id, value}) => (packsConf[id] = value))
      this.setState({packsConf})
    }
  }

  formRow(name, value, metric) {
    let type = "text"
    if (metric === "text") {
      type = "textarea"
    }
    return (
      <Container {...css({marginTop: 20})} key={name}>
        <Col xs="4">
          {name}
        </Col>
        <Col xs="4">
          <Input
            type={type}
            placeholder="Value"
            value={value}
            onChange={::this.onChange(name)}
          />
        </Col>
        <Col xs="2">
          {metric}
        </Col>
        <Col xs="2">
          <Button block onClick={::this.onSubmit(name)}>
            {name ? "Update" : "Add"}
          </Button>
        </Col>
      </Container>
    )
  }
  
  
  formRowPacks(name, price, id) {
    let type = "text"
    return (
      <Container {...css({marginTop: 20})} key={id}>
        <Col xs="4">
          {name}
        </Col>
        <Col xs="4">
          <Input
            type={type}
            placeholder="Value"
            value={price}
            onChange={::this.onChangePack(id)}
          />
        </Col>
        <Col xs="2">
          €
        </Col>
        <Col xs="2">
          <Button block onClick={::this.onSubmitPacks(id)}>
            {name ? "Update" : "Add"}
          </Button>
        </Col>
      </Container>
    )
  }

  render() {
    return (
	<div>
        {this.state.configs.map(({name, value, metric}) =>
          this.formRow(name, value, metric),
        )}
	<hr/>
	<p>
		Configuration des packs (nombre d'offres et prix)
	</p>
		{this.state.packsConf.map(({Name, offers, price, id}) =>
          this.formRowPacks(Name, price, id),
        )}
	 </div>
    )
  }
}

class Categories extends Component {
  constructor(props) {
    super(props)
    this.state = {
      categories: [],
	  uploadok: false,
	  usedUserImage: [],
    }
  }

  async fetchCategories() {
    const {data} = await axios.get("/admin/api/categories")
    this.setState({categories: data})
  }

  async componentWillMount() {
    this.fetchCategories()
	var userImages = await axios.get("/admin/api/config/userImages")
	if (userImages.data){
		this.setState({userImages: userImages.data})
	}
  }

  openModal(category) {
    const emojis = {};
	const usedUserImage = {}
	;(category.images || []).forEach((img) => {
		if (img.includes('raw.githubusercontent.com')){
			emojis[img] = {}
		}
		else{
			usedUserImage[img] = {}
		}
	})
    return () => {
      this.setState({emojis, category, usedUserImage})
    }
  }

  handleImageClick(image) {
    return () => {
      if (this.state.emojis[image]) {
		  var em = this.state.emojis
		  delete em[image];
        this.setState({
          emojis: em,
        })
      } else {
        this.setState({
          emojis: {...this.state.emojis, [image]: {}},
        })
      }
    }
  }
  
  handleUserImageClick(image){
	  return () => {
      if (this.state.usedUserImage[image]) {
		  var em = this.state.usedUserImage
		  delete em[image];
        this.setState({
          usedUserImage: em,
        })
      } else {
        this.setState({
          usedUserImage: {...this.state.usedUserImage, [image]: {}},
        })
      }
    }
  }

  getBorder(image) {
    if (this.state.emojis[image]) return "2px solid red"
    else return "2px solid transparent"
  }
  
  getUserBorder(image) {
    if (this.state.usedUserImage[image]) return "2px solid red"
    else return "2px solid transparent"
  }

  async setImages() {
    await axios.put(
      `/admin/api/categories/${this.state.category.id}/images`,
      Object.keys({...this.state.emojis, ...this.state.usedUserImage}),
    )
    await this.fetchCategories()
    this.setState({
      category: undefined,
      emojis: undefined,
	  usedUserImage: [],
    })
  }
  
  addImages = event =>{
	  this.setState({
      selectedFile: event.target.files[0],
      loaded: 0,
	  uploadok: false,
    })
  }
  
  onClickHandler = async () => {
   const data = new FormData()
   data.append('file', this.state.selectedFile)
   var res = await axios.post("/admin/api/config/postImages", data)
   if (res.status === 200){
	   this.setState({
      uploadok: true,
    })
   }
   setTimeout(function(){ window.location.reload(); }, 2000);
}

  render() {
    return (
      <Table>
        <Modal
          isOpen={!!this.state.emojis}
          toggle={() => this.setState({emojis: undefined})}
        >
          <ModalHeader>
            Choose emojis for {(this.state.category || {}).name}
          </ModalHeader>
          <ModalBody>
            {this.state.emojis
              ? emojiImages.map(image =>
                  <img
                    {...css({
                      width: 30,
                      height: "auto",
                      cursor: "pointer",
                    })}
                    style={{border: ::this.getBorder(image)}}
                    onClick={::this.handleImageClick(image)}
                    key={image}
                    src={emoji2base64[image]}
                    alt=""
                  />,
                )
              : undefined}
			  {this.state.userImages ?
			  this.state.userImages.map(image =>
                  <img
                    {...css({
                      width: 30,
                      height: "auto",
                      cursor: "pointer",
                    })}
                    style={{border: ::this.getUserBorder(image)}}
                    onClick={::this.handleUserImageClick(image)}
                    key={image}
                    src={image}
                    alt=""
                  />,
                )
			  : undefined}
            <Button color="success" onClick={::this.setImages}>
              Validez
            </Button>
          </ModalBody>
        </Modal>
        <thead>
          <tr>
            <th>name</th>
            <th>#</th>
          </tr>
        </thead>
        <tbody>
          {this.state.categories.map(cat =>
            <tr key={cat.id}>
              <td>
                {cat.name}
              </td>
              <td>
                <Button color="primary" onClick={::this.openModal(cat)}>
                  Edit Images
                </Button>
              </td>
            </tr>,
          )}
        </tbody>
		<input type="file" name="Ajouter des images" onChange={this.addImages}/>
	   <button type="button" class="btn btn-success btn-block" onClick={this.onClickHandler}>Upload</button> 
		   {this.state.uploadok ? (
		   <Alert color="success">
		   File uploaded succesfully ! 
			</Alert>
		   )
		   :undefined}
      </Table>
    )
  }
}

class ProValidation extends Component {
  constructor(props) {
    super(props)
    this.state = {
      toValidate: [],
    }
  }

  async fetchToValidate() {
    const {data} = await axios.get("/admin/api/validations/pro")
    this.setState({toValidate: data})
  }

  async confirmDeletion() {
    const {id} = this.state.selected
    await axios.delete(`/admin/api/validations/pro/${id}`)
    await this.fetchToValidate()
    this.setState({
      confirmDeletion: false,
      selected: undefined,
    })
  }

  async confirmValidation() {
    await axios.put("/admin/api/validations/pro", {
      id: this.state.selected.id,
    })
    await this.fetchToValidate()
    this.setState({
      confirmValidation: false,
      selected: undefined,
    })
  }

  componentWillMount() {
    this.fetchToValidate()
  }

  renderSelected() {
    return (
      <Container>
        <Modal
          isOpen={this.state.confirmValidation}
          toggle={() => this.setState({confirmValidation: false})}
        >
          <ModalHeader>Confirmez la validation</ModalHeader>
          <ModalBody>
            <p>
              Confirmez-vous la validation de {this.state.selected.companyName}{" "}
              ?
            </p>
            <Button onClick={::this.confirmValidation} color="success">
              Confirmez
            </Button>
            <Button
              color="danger"
              onClick={() => this.setState({confirmValidation: false})}
            >
              Annuler
            </Button>
          </ModalBody>
        </Modal>
        <Modal
          isOpen={this.state.confirmDeletion}
          toggle={() => this.setState({confirmDeletion: false})}
        >
          <ModalHeader>Confirmez la suppression</ModalHeader>
          <ModalBody>
            <p>
              Confirmez-vous la suppression de {this.state.selected.companyName}{" "}
              ?
            </p>
            <Button onClick={::this.confirmDeletion} color="success">
              Confirmez
            </Button>
            <Button
              color="danger"
              onClick={() => this.setState({confirmDeletion: false})}
            >
              Annuler
            </Button>
          </ModalBody>
        </Modal>
        <Button
          onClick={() => this.setState({selected: undefined})}
          color="link"
        >
          Retour
        </Button>
        {Object.entries(this.state.selected).map(([name, value]) =>
          <Row key={name}>
            <strong>{name}</strong> {JSON.stringify(value)}
          </Row>,
        )}
        <Button
          color="success"
          onClick={() => this.setState({confirmValidation: true})}
        >
          Valider
        </Button>
        <Button
          color="danger"
          onClick={() => this.setState({confirmDeletion: true})}
        >
          Supprimer
        </Button>
      </Container>
    )
  }

  render() {
    if (this.state.selected) {
      return this.renderSelected()
    }
    return (
      <Table>
        <thead>
          <tr>
            <th>email</th>
            <th>nom de l'entreprise</th>
            <th>nom</th>
            <th>#</th>
          </tr>
        </thead>
        <tbody>
          {this.state.toValidate.map(pro =>
            <tr key={pro.id}>
              <td>
                {pro.email}
              </td>
              <td>
                {pro.companyName}
              </td>
              <td>
                {pro.firstName} {pro.lastName}
              </td>
              <Button
                color="primary"
                onClick={() => this.setState({selected: pro})}
              >
                Voir
              </Button>
            </tr>,
          )}
        </tbody>
      </Table>
    )
  }
}

class Admin extends Component {
  render() {
    return (
      <div>
        <Navbar full {...styles.navbar}>
          <NavbarBrand>WinWin Admin</NavbarBrand>
        </Navbar>
        <Col {...styles.list} md="3">
          <Link to="/admin/config">
            <div {...styles.link}>
              <p>Configuration</p>
            </div>
          </Link>
          <Link to="/admin/validations/pro">
            <div {...styles.link}>
              <p>Validation des Pros</p>
            </div>
          </Link>
          <Link to="/admin/categories">
            <div {...styles.link}>
              <p>Categories</p>
            </div>
          </Link>
        </Col>
        <Col md="9" {...styles.scrollable}>
          <Match pattern="/admin/config" component={Config} />
          <Match pattern="/admin/validations/pro" component={ProValidation} />
          <Match pattern="/admin/categories" component={Categories} />
        </Col>
      </div>
    )
  }
}

export default Admin
