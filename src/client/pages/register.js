import React, {Component} from "react"
import {Container, Col, Row, Button, Alert} from "reactstrap"
import {css} from "glamor"
import {Fieldset, createValue} from "react-forms"
import {validate as oldValidate} from "react-forms/lib/Schema"
import {Map, Marker, TileLayer} from "react-leaflet"
import {Redirect} from "react-router"
import Input from "../components/input"
import schema from "../../schemas/create-pro"
import {resolveAddress} from "../../lib/geocoding"
import axios from "axios"
import {MapAccessToken} from "../../config"


const container = css({
  padding: "30px 20%",
  overflow: "auto",
  height: "calc(100% - 50px)",
})

class RegisterForm extends Component {
  constructor(props) {
    super(props)

    const passwordMatch = (schema, value) => {
      if (value.password && value.passwordConfirm) {
        if (value.password !== value.passwordConfirm) {
          return [
            {
              field: "data.passwordConfirm",
              message: "Les mots de passes ne correspondent pas",
            },
          ]
        }
      }
      return []
    }

    const validate = (schema, value) => [
      ...oldValidate(schema, value),
      ...passwordMatch(schema, value),
    ]

    const formValue = createValue({
      value: {
        gender: "Female",
        country: "France",
        category: "Autre...",
      },
      onChange: ::this.onChange,
      schema,
      validate,
    })
    this.state = {
      formValue,
      shopLocation: {
        lat: 48.866667,
        lon: 2.333333,
      },
    }
  }

  async locateShop() {
    const finalValues = this.state.formValue.value
    const {address, city, zipcode, country} = finalValues
    const [location] = await resolveAddress(
      `${address}, ${zipcode} ${city}, ${country}`,
    )
    this.setState({
      shopLocation: location
        ? {
            lat: location.lat,
            lon: location.lon,
          }
        : {
            lat: 48.866667,
            lon: 2.333333,
          },
      finalValues,
    })
    if (!location) {
      alert("Nous n'avons pas trouver votre addresse")
    }
  }

  async confirm() {
    try {
      await axios.post("/api/pros", {
        ...this.state.finalValues,
        shopLocation: this.state.shopLocation,
      })
      this.setState({finished: true})
    } catch (err) {
      this.setState({
        shopLocation: undefined,
        finalValues: undefined,
      })
      console.log(err.response)
      const {data} = err.response
      if (data) {
        this.setState({errAlert: data})
      } else {
        this.setState({errAlert: "An error occured"})
      }
    }
  }

  onChange(formValue) {
    this.setState({formValue})
  }

  changeLat(e) {
    this.setState({
      shopLocation: {
        lat: e.target.value,
        lon: this.state.shopLocation.lon,
      },
    })
  }

  changeLon(e) {
    this.setState({
      shopLocation: {
        lat: this.state.shopLocation.lat,
        lon: e.target.value,
      },
    })
  }

  renderMap() {
    const {lat, lon} = this.state.shopLocation
    return (
      <Container {...container}>
        <h3>Confirmez la position de votre enseigne</h3>
        <p>
          lat:
          <input
            onChange={::this.changeLat}
            value={this.state.shopLocation.lat}
          />
        </p>
        <p>
          lon:
          <input
            onChange={::this.changeLon}
            value={this.state.shopLocation.lon}
          />
        </p>
        <Map
          style={{width: "100%", height: "300px"}}
          center={[lat, lon]}
          zoom={15}
          onClick={({latlng: {lat, lng}}) =>
            this.setState({shopLocation: {lat, lon: lng}})}
        >
          <TileLayer url={"https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token="+MapAccessToken} />
          <Marker position={[lat, lon]} />
        </Map>
        <Button
          block
          color="success"
          {...css({marginTop: 20})}
          onClick={::this.confirm}
        >
          Confirmer
        </Button>
      </Container>
    )
  }

  render() {
    if (this.state.finished) {
      return <Redirect to="/login" />
    }
    if (this.state.finalValues && this.state.shopLocation) {
      return this.renderMap()
    }
    return (
      <Container {...container}>
        <Alert
          color="danger"
          isOpen={!!this.state.errAlert}
          toggle={() => this.setState({errAlert: null})}
        >
          {this.state.errAlert}
        </Alert>
        <h1>S'inscrire</h1>
        <Fieldset formValue={this.state.formValue}>
          <h3>Votre entreprise</h3>
          <Input select="companyName" label="Nom de l'entreprise" />
          <Input select="address" label="Adresse" />
          <Row>
            <Col md="6">
              <Input select="city" label="Ville" />
            </Col>
            <Col md="6">
              <Input select="zipcode" label="Code Postale" />
            </Col>
          </Row>
          <Input type="select" select="country" label="Pays">
            {schema.properties.country.enum.map(v =>
              <option key={v} value={v}>
                {v}
              </option>,
            )}
          </Input>
          <Input type="select" select="category" label="Secteur d'activité">
            {schema.properties.category.enum.map(v =>
              <option key={v} value={v}>
                {v}
              </option>,
            )}
          </Input>
          <h3>Vous</h3>
          <Input type="select" select="gender" label="Sexe">
            <option value="Female">Femme</option>
            <option value="Male">Homme</option>
          </Input>
          <Row>
            <Col md="6">
              <Input select="firstName" label="Prénom" />
            </Col>
            <Col md="6">
              <Input select="lastName" label="Nom de famille" />
            </Col>
          </Row>
          <Input select="email" label="Email" />
          <Row>
            <Col md="6">
              <Input type="password" select="password" label="Mot de passe" />
            </Col>
            <Col md="6">
              <Input
                type="password"
                select="passwordConfirm"
                label="Confirmation du mot de passe"
              />
            </Col>
          </Row>
          <Input select="phone" label="Téléphone" />
        </Fieldset>
        <Button
          block
          disabled={this.state.formValue._errorList.length > 0}
          onClick={::this.locateShop}
        >
          Soumettre
        </Button>
      </Container>
    )
  }
}

export default RegisterForm
