import React, {Component} from "react"
import {css} from "glamor"
import {Button} from "reactstrap"
import PutOfferIcon from "react-icons/lib/io/location"
import EditIcon from "react-icons/lib/io/edit"
import TrashIcon from "react-icons/lib/io/ios-trash"
import axios from "axios"
import moment from "moment"

import {bindActionCreators} from "redux"
import {connect} from "react-redux"

import CreateCampaignModal from "./create-campaign-modal"
import CreateWinpointsModal from "./create-winpoints-modal"
import DeleteModal from "./delete-modal"
import {setPutOffers, setListOffers, setNormal} from "../redux/map-mode"
import {setOffers} from "../redux/offers"

const styles = {
  menu: css({
    width: "100%",
  }),
  header: css({
    background: "#444",
    height: 50,
    color: "white",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingRight: 10,
  }),
  title: css({
    margin: 0,
    marginLeft: 10,
  }),
  addOffer: css({
    textAlign: "center",
    margin: "10px 10% 20px",
    width: "80%",
  }),
  box: css({
    height: "calc(100% - 40px)",
    overflow: "scroll",
    "@media (max-width: 991px)": {
      height: "calc(50% - 40px)",
    },
  }),
  counts: css({
    "& > p": {
      margin: 0,
      fontSize: 10,
    },
  }),
  code: css({
    fontSize: 14,
  }),
  plus: css({
    ":hover": {
      cursor: "pointer",
    },
  }),
  offerItem: css({
    padding: 10,
    margin: 0,
    borderBottom: "1px solid #DDD",
    display: "flex",
    flexFlow: "row wrap",
    alignItems: "center",
    justifyContent: "space-between",
  }),
  selected: css({
    background: "rgba(0, 0, 0, .1)",
  }),
  active: css({
    color: "rgb(55, 165, 68)",
  }),
  finished: css({
    color: "rgb(172, 57, 129)",
  }),
  offerDesc: css({
    display: "flex",
    cursor: "pointer",
    width: "40%",
    alignItems: "center",
    "& > p": {
      margin: "0 5",
    },
    "& > img": {
      height: 16,
      width: "auto",
    },
  }),
}

function offerKind(offer) {
  const now = moment()
  const since = moment(offer.since)
  const until = moment(offer.until)

  if (since > now) {
    return "inactive"
  } else if (since <= now && until >= now) {
    return "active"
  } else {
    return "finished"
  }
}

function getStyleForKind(kind) {
  if (kind === "active") {
    return styles.active
  }

  if (kind === "finished") {
    return styles.finished
  }
  return {}
}

class OffersMenu extends Component {
  constructor(...props) {
    super(...props)
    this.state = {
      isOpen: false,
      deleteIsOpen: false,
      deleteUrl: null,
    }
  }

  async fetchOffers() {
    const {data: refunds} = await axios.get("/api/offers", {
      withCredentials: true,
    })
    this.props.setOffers(refunds)
  }

  async editOffer(index) {
    if (this.state.intervalId) {
      clearInterval(this.state.intervalId)
    }
    this.setState({selected: undefined})
    const {setPutOffers} = this.props
    const offer = this.props.offers[index]
    const {data} = await axios.get(`/api/offers/${offer.id}/positions`)
    const positions = data.map(({x, y}) => [x, y])
    setPutOffers(offer, positions)
  }

  showCampaignPositions(index) {
    const {setListOffers} = this.props
    const campaign = this.props.offers[index]
    const fetchCampaign = async () => {
      const {data} = await axios.get(`/api/offers/${campaign.id}/positions/all`)
      setListOffers(campaign, data)
    }
    this.setState({intervalId: setInterval(fetchCampaign, 2000)})
    fetchCampaign()
  }

  componentWillMount() {
    this.fetchOffers()
    this.intervalId = setInterval(::this.fetchOffers, 2000)
  }

  componentWillUnmount() {
    clearInterval(this.intervalId)
  }

  componentWillUpdate(nextProps, nextState) {
    if (this.state.isOpen && !nextState.isOpen) {
      this.fetchOffers()
    }
  }

  toggleModal() {
    this.setState({isOpen: !this.state.isOpen})
	if(this.state.isOpen)
	{
		window.location.reload()
	}
  }

  toggleWinpoints() {
    this.setState({isWinpointsOpen: !this.state.isWinpointsOpen})
  }

  handleCampaignClick(i) {
    return () => {
      if (this.state.intervalId) {
        clearInterval(this.state.intervalId)
      }
      if (this.state.selected === i) {
        this.setState({selected: undefined})
        this.props.setNormal()
      } else {
        this.setState({selected: i})
        this.showCampaignPositions(i)
      }
    }
  }

  cloneOffer() {
    const oldEditOffer = this.state.editOffer
    this.setState({
      editOffer: undefined,
      clone: true,
    })
    setTimeout(() => {
      this.setState({
        editOffer: {
          ...oldEditOffer,
          id: undefined,
          label: `${oldEditOffer.label} (clone)`,
        },
      })
    }, 1000)
  }

  render() {
    const {offers} = this.props
    return (
      <div {...styles.menu}>
        <CreateWinpointsModal
          isOpen={this.state.isWinpointsOpen}
          toggle={::this.toggleWinpoints}
        />
        <CreateCampaignModal
          isOpen={this.state.isOpen}
          toggle={::this.toggleModal}
        />
        <CreateCampaignModal
          isOpen={!!this.state.editOffer}
          toggle={() => {this.setState({editOffer: undefined, clone: false})
		  }}
          edit={!this.state.clone}
          initialValues={this.state.editOffer}
          cloneOffer={::this.cloneOffer}
        />
        <DeleteModal
          isOpen={this.state.deleteIsOpen}
          toggle={() => this.setState({deleteIsOpen: false})}
          deleteUrl={this.state.deleteUrl}
          sentence="Supprimer une campagne ?"
        />
        <div {...styles.header}>
          <p {...styles.title}>Mes Campagnes</p>
          <div {...styles.counts}>
            <p>
              offres:{" "}
              {this.props.offers.reduce(
                (sum, offer) => sum + +offer.totalCount,
                0,
              )}
            </p>
            <p>
              attrapées:{" "}
              {this.props.offers.reduce(
                (sum, offer) => sum + +offer.catchedCount,
                0,
              )}
            </p>
            <p>
              utilisées:{" "}
              {this.props.offers.reduce(
                (sum, offer) => sum + +offer.usedCount,
                0,
              )}
            </p>
          </div>
        </div>
        <div {...styles.box}>
          <div {...styles.listOffers}>
            {offers && offers.length > 0
              ? offers.map((refund, index) =>
                  <div
                    key={index}
                    {...styles.offerItem}
                    {...(this.state.selected === index ? styles.selected : {})}
                    {...getStyleForKind(offerKind(refund))}
                  >
                    <div
                      {...styles.offerDesc}
                      onClick={::this.handleCampaignClick(index)}
                    >
                      <img src={refund.image} alt="" />
                      <p>
                        {refund.label}
                        <br />
                        <span style={{fontSize: 11}}>
                          expire {moment(refund.until).locale("fr").fromNow()}
                        </span>
                      </p>
                    </div>
                    <div {...styles.code}>
                      {refund.code}
                    </div>
                    <div {...styles.counts}>
                      <p>
                        total: {refund.totalCount}
                      </p>
                      <p>
                        attrapées: {refund.catchedCount}
                      </p>
                      <p>
                        utilisées: {refund.usedCount}
                      </p>
                    </div>
                    <div>
                      {!refund.winpts
                        ? <Button
                            size="sm"
                            style={{marginRight: 5}}
                            onClick={() => this.setState({editOffer: refund})}
                          >
                            <EditIcon />
                          </Button>
                        : <div
                            style={{
                              width: 32,
                              height: 1,
                              display: "inline-block",
                            }}
                          />}
                      <Button
                        size="sm"
                        style={{marginRight: 5}}
                        onClick={() => this.editOffer(index)}
                      >
                        <PutOfferIcon />
                      </Button>
                      {offerKind(refund) !== "active"
                        ? <Button
                            size="sm"
                            onClick={() =>
                              this.setState({
                                deleteIsOpen: true,
                                deleteUrl: `/api/offers/${refund.id}`,
                              })}
                          >
                            <TrashIcon />
                          </Button>
                        : <div
                            style={{
                              width: 32,
                              height: 1,
                              display: "inline-block",
                            }}
                          />}
                    </div>
                  </div>,
                )
              : undefined}
            <Button {...styles.addOffer} onClick={::this.toggleModal}>
              Ajouter une campagne
            </Button>
            {this.props.user && this.props.user.email === "admin@admin.com"
              ? <Button {...styles.addOffer} onClick={::this.toggleWinpoints}>
                  Ajouter une campagne winpoints
                </Button>
              : undefined}
          </div>
        </div>
      </div>
    )
  }
}

const mapState = ({offers, me: {user}}) => ({offers, user})
const mapDispatch = dispatch =>
  bindActionCreators(
    {
      setPutOffers,
      setOffers,
      setNormal,
      setListOffers,
    },
    dispatch,
  )

export default connect(mapState, mapDispatch)(OffersMenu)
