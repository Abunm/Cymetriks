import React from "react"
import {css} from "glamor"
import {Map, TileLayer, Marker, Popup} from "react-leaflet"
import {Modal, ModalHeader, ModalBody, Button, Container, Col} from "reactstrap"

import {bindActionCreators} from "redux"
import {connect} from "react-redux"
import {compose, mapProps, withState} from "recompose"
import axios from "axios"
import _ from "lodash"

import {navBarHeight} from "../styles/constants"
import OffersMenu from "../components/offers-menu"
import ConnexionModal from "../components/connexion-modal"
import PaymentModal from "../components/payment-modal"

import {setNormal, addMarker, removeMarker} from "../redux/map-mode"
import {logout, updateMe} from "../redux/me"
import {MapAccessToken} from "../../config"

const L = global.L
const maxCircle = 200000

const redIcon = new L.Icon({
  iconUrl:
    "https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

const greyIcon = new L.Icon({
  iconUrl:
    "https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

const styles = {
  map: css({
    width: "100%",
    height: `calc(100vh - ${navBarHeight}px)`,
    "@media (max-width: 991px)": {
      height: `calc(50vh - ${navBarHeight}px)`,
    },
  }),
  row: css({
    height: `calc(100% - ${navBarHeight}px)`,
  }),
  offersMenuCol: css({
    paddingLeft: "0 !important",
    paddingRight: "0 !important",
  }),
  mapCol: css({
    paddingRight: "0 !important",
    paddingLeft: "0 !important",
  }),
  putOffer: css({
    position: "absolute",
    width: "100%",
    bottom: 0,
    zIndex: 1000,
    background: "#50c1c5",
    fontSize: 16,
    display: "flex",
    padding: 10,
    alignItems: "center",
    justifyContent: "space-between",
    "& > p": {
      margin: 0,
    },
    ":after": {
      content: "none !important",
    },
  }),
  putOfferButton: css({
    marginLeft: 20,
    background: "transparent !important",
    borderColor: "#373a3c !important",
    "@media (max-width: 991px)": {
      fontSize: 10,
      margin: "5px 0 0",
    },
  }),
  putOfferButtons: css({
    textAlign: "right",
  }),
}

const defaultLocation = [48.866667, 2.333333]
var circle = 10000
const pointToLatLng = ({x, y}) => [x, y]

const getRandomArbitrary = (min, max) => {
  return Math.random() * (max - min) + min;
}

const putMarker = (mapMode, addMarker, money, setPaymentModalOpen) => {
    if (mapMode.mode === "put_offers") {
      return ({latlng}) => 
		  {
			var toplace = parseInt(mapMode.offer.offerCount, 10)
			if(!isNaN(toplace))
			{
				if(toplace > 0)
				{
					for(var i = 0 ; i< toplace; i++){
						var R = getRandomArbitrary(0, circle*10)
						var Theta = getRandomArbitrary(0, 2*3.14)
						const Rt = 6370000
						var lat = latlng.lat + Math.atan(R*Math.cos(Theta)/Rt)
						var lng = latlng.lng + Math.atan(R*Math.sin(Theta)/Rt)
						var alatlon = {lat, lng}
						
						addMarker(alatlon)
					}
					mapMode.offer.offerCount = 0
				}
			}
			
		  }
    }

}

const confirm = (mapMode, setNormal) => async () => {
  await axios.post(`/api/offers/${mapMode.offer.id}/positions`, mapMode.markers)
  setNormal()
}

const circlesize = e => {
	var val = parseInt(e.target.value, 10)
	if(val >= 0 && val <= maxCircle)
	{
		circle = val
	}
}

const ValidationModal = ({user, logout}) =>
  <Modal isOpen={user && !user.validated} toggle={_.noop}>
    <ModalHeader>Compte non validée</ModalHeader>
    <ModalBody>
      <p>Votre compte n'a pas encore été validé par un administrateur.</p>
      <Button block color="danger" onClick={logout}>
        Se déconnecter
      </Button>
    </ModalBody>
  </Modal>

const MapPage = ({
  user,
  position,
  mapMode,
  setNormal,
  removeMarker,
  addMarker,
  logout,
  money,
  paymentModalOpen,
  setPaymentModalOpen,
  updateMe,
}) =>
  <div>
    <ConnexionModal user={user} />
    <ValidationModal user={user} logout={logout} />
    <PaymentModal
      paymentModalOpen={paymentModalOpen}
      setPaymentModalOpen={setPaymentModalOpen}
      email={user ? user.email : null}
      updateMe={updateMe}
    />
    <div {...styles.row}>
      <Col lg="8" {...styles.mapCol}>
        <Map
          className={`${styles.map}`}
          center={position}
          zoom={13}
          onClick={putMarker(
            mapMode,
            addMarker,
            money,
            setPaymentModalOpen,
          )}
        >
          <div
            {...css({
              position: "absolute",
              right: 10,
              top: 10,
              zIndex: 800,
              "> *": {
                display: "inline-block",
                marginLeft: 20,
                verticalAlign: "middle",
              },
            })}
          >
            <h4>
              {money} €
            </h4>
            <Button color="primary" onClick={() => setPaymentModalOpen(true)}>
              Recharger mon compte
            </Button>
          </div>
          <TileLayer url={"https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token="+MapAccessToken} />
          <Marker
            position={position}
            icon={L.icon.glyph({
              prefix: "mdi",
              glyphSize: "15px",
              glyph: "home",
            })}
          />
          {mapMode.mode === "put_offers"
            ? mapMode.markers.map((latlng, i) =>
                <Marker
                  position={latlng}
                  key={latlng}
                  onClick={L.DomEvent.stop}
                  icon={greyIcon}
                />,
              )
            : undefined}
          {mapMode.mode === "list_offers"
            ? mapMode.offers.map((offer, i) => {
                const hasOwner = !!Object.keys(offer.owner).length
                const {x, y} = offer.owner.lastPosition || offer.position
                return (
                  <Marker
                    position={[x, y]}
                    key={offer.id}
                    icon={hasOwner ? redIcon : greyIcon}
                  >
                    {hasOwner
                      ? <Popup>
                          <p>
                            Offre prise par {offer.owner.username}
                          </p>
                        </Popup>
                      : undefined}
                  </Marker>
                )
              })
            : undefined}
        </Map>
        {mapMode.mode === "put_offers"
          ? <Container
              {...styles.putOffer}
              onClick={e => {
                e.stopPropagation()
                e.preventDefault()
              }}
            >
              <p>
                {`${mapMode.offer.offerCount} offres à placer`}
              </p>
			<p>
				Taille de la zone de placement (m):
			</p>
			<input type="number" min="0" value={circle} onChange={circlesize} default="1000"/>
              <div {...styles.putOfferButtons}>
                <Button
                  {...styles.putOfferButton}
                  onClick={setNormal}
                  size="sm"
                >
                  Annuler
                </Button>
                <Button
                  {...styles.putOfferButton}
                  onClick={confirm(mapMode, setNormal)}
                  size="sm"
                >
                  Confirmer
                </Button>
              </div>
            </Container>
          : undefined}
      </Col>
      <Col lg="4" {...styles.offersMenuCol}>
        <OffersMenu />
      </Col>
    </div>
  </div>

const mapStateToProps = state => ({
  user: state.me.user,
  mapMode: state.mapMode,
  offers: state.offers,
})

const mapDispatch = dispatch =>
  bindActionCreators(
    {setNormal, addMarker, removeMarker, logout, updateMe},
    dispatch,
  )

const mapPosition = mapProps(props => ({
  ...props,
  position: props.user
    ? pointToLatLng(props.user.shopLocation)
    : defaultLocation,
}))

const mapmoney = mapProps(props => {
  return {
    ...props,
    money:
      (props.user || {}).balance,
  }
})

const withPaymentModalState = withState(
  "paymentModalOpen",
  "setPaymentModalOpen",
  false,
)

export default compose(
  connect(mapStateToProps, mapDispatch),
  mapPosition,
  mapmoney,
  withPaymentModalState,
)(MapPage)
