import "react-datetime/css/react-datetime.css"

import React from "react"
import {css} from "glamor"
import {withState, mapProps, compose} from "recompose"
import {connect} from "react-redux"
import Datetime from "react-datetime"
import axios from "axios"
import moment from "moment"



import {
  Modal,
  ModalHeader,
  ModalBody,
  FormGroup,
  Label,
  Col,
  Row,
  Button,
  Input as RealInput,
} from "reactstrap"

import Select from "react-select"


import {offerForCreate} from "../../types/offer"
import Form from "./form"

import UploadAdModal from "./upload-ad-modal"


const styles = {
  select: css({
    marginBottom: 16,
  }),
  img: css({
    height: 20,
    width: 20,
    display: "inline-block",
    verticalAlign: "middle",
    marginRight: 10,
  }),
}

const withCategoryState = withState("category", "setCategory", null)
const withPackState = withState("pack", "setPacks", {
  value: 0,
  label: "Selectionez un pack...",
  price: "--",
  amount: "--",
  clearableValue: false,
  pers: false
})

const withImageState = withState("image", "setImage", null)
const withDateState = withState("until", "setUntil", null)
const withSinceState = withState("since", "setSince", null)
const withImageModalState = withState(
  "imageModalOpen",
  "setImageModalOpen",
  false,
)
const withUpdateCodeState = withState("updateCode", "setUpdateCode", false)
const withUploadAdModalState = withState(
  "uploadModalOpen",
  "setUploadModalOpen",
  false,
)

const mapSetCategory = ({setCategory, setImage, ...props}) => ({
  ...props,
  setCategory: category => {
    setImage(category.imageUrl)
    setCategory(category)
  },
  setImage,
})

const mapSetPacks = ({setPacks, ...props}) => ({
  ...props,
  setPacks: pack => {
    setPacks(pack)
  },
})

const categoryToOption = category => ({
  value: category.id,
  label: category.name,
  imageUrl: category.images[0],
  images: category.images,
  clearableValue: false,
})

const PacksToOption = pack => ({
  value: pack.id,
  label: pack.Name,
  price: pack.price,
  amount: pack.offers,
  pers: pack.custom,
  clearableValue: false,
})

const mapDefaults = ({
  initialValues,
  image,
  category,
  until,
  since,
  pack,
  ...rest
}) => ({
  image: image || (initialValues || {}).image,
  /* eslint-disable */
  category: do {
    if (category) {
      category
    } else if (initialValues && initialValues.category) {
      categoryToOption(initialValues.category)
    }
  },
  until: do {
    if (until) {
      until
    } else if (initialValues && initialValues.until) {
      moment(initialValues.until)
    }
  },
  since: do {
    if (since) {
      since
    } else if (initialValues && initialValues.since) {
      moment(initialValues.since)
    }
  },
  pack: do {
    if (pack) {
      pack
    } else if (initialValues && initialValues.pack) {
      PacksToOption(initialValues.pack)
    }
  },
  /* eslint-enable */
  initialValues,
  ...rest,
})

const getCategories = async () => {
  var res = await axios.get("/api/categories")

  var categories = {
    options: res.data.map(categoryToOption),
  }
	
  return categories
}


const getPacks = async () => {

  var res2 = await axios.get("/payment/Packs")

  var packs = {
    options: res2.data.map(PacksToOption),
  }


  return packs
}


const Value = ({value, children}) =>
  <div className="Select-value" title={value.title}>
    <span className="Select-value-label">
      <img {...styles.img} src={value.imageUrl} alt="" />
      {children}
    </span>
  </div>

const onMouseDown = (onSelect, option) => event => {
  event.preventDefault()
  event.stopPropagation()
  onSelect(option, event)
}

const onMouseEnter = (onFocus, option) => event => {
  onFocus(option, event)
}

const onMouseMove = (isFocused, onFocus, option) => event => {
  if (!isFocused) {
    onFocus(option, event)
  }
}
var persoffv = 0
const persoff = e => {
	persoffv = parseInt(e.target.value, 10)
}

const Option = ({children, className, isFocused, onFocus, onSelect, option}) =>
  <div
    className={className}
    onMouseDown={onMouseDown(onSelect, option)}
    onMouseEnter={onMouseEnter(onFocus, option)}
    onMouseMove={onMouseMove(isFocused, onFocus, option)}
    title={option.title}
  >
    <img {...styles.img} src={option.imageUrl} alt="" />
    {children}
  </div>

function beforeSubmit(category, image, until, since, updateCode, pack, edit) {
  return body => {
    if (category && image && until && since && pack &&((pack.value !== 0) || (pack.pers && persoffv!==0))) {
      body.category = category.value
      body.image = image
      body.until = until
      body.since = since
      body.updateCode = !!updateCode
	  body.pack = pack
	  if(pack.pers){
		body.offerCount = persoffv
	  }else {
		body.offerCount = pack.amount
	  }
      return true
    } else if(edit && category && image && until && since) {
	  body.category = category.value
      body.image = image
      body.until = until
      body.since = since
      body.updateCode = !!updateCode
	  return true
    }else {
      return false
    }
  }
}

const ChooseImageModal = ({images, setImage, isOpen, toggle}) =>
  <Modal isOpen={isOpen} toggle={toggle}>
    {(images || []).map(image =>
      <img
        alt=""
        {...css({
          width: 30,
          height: "auto",
          cursor: "pointer",
          margin: 10,
        })}
        onClick={() => {
          setImage(image)
          toggle()
        }}
        key={image}
        src={image}
      />,
    )}
  </Modal>
  

const CreateOfferModal = ({
  edit = false,
  initialValues,
  isOpen,
  toggle,
  pack,
  setPacks,
  category,
  setCategory,
  image,
  setImage,
  until,
  setUntil,
  since,
  setSince,
  user,
  setImageModalOpen,
  imageModalOpen,
  uploadModalOpen,
  setUploadModalOpen,
  updateCode,
  setUpdateCode,
  cloneOffer,
}) =>
  <Modal isOpen={isOpen} toggle={toggle}>
    <ChooseImageModal
      isOpen={imageModalOpen}
      toggle={() => setImageModalOpen(false)}
      images={(category || {}).images}
      setImage={setImage}
    />
    <UploadAdModal
      isOpen={uploadModalOpen}
      toggle={() => setUploadModalOpen(false)}
      initialValues={initialValues}
      key={initialValues && initialValues.id}
    />
    <ModalHeader>
      {edit ? <p>Mettre à jour la campagne</p> : <p>Créer une campagne</p>}
    </ModalHeader>
    <ModalBody>
      <Label>Type de la campagne</Label>
      <Form
        schema={offerForCreate}
        url={
          edit && initialValues
            ? `/api/offers/${initialValues.id}`
            : "/api/offers"
        }
        method={edit ? "put" : "post"}
        beforeSubmit={beforeSubmit(category, image, until, since, updateCode, pack, edit)}
        onSuccess={() => {toggle()
		}}
        dontValidate={["category", "image", "until", "since", "offerCount", "pack"]}
        defaultValues={initialValues}
      >
        {(Input, Submit) =>
          <div>
            <Select.Async
				cacheOptions
				isMulti
              className={`${styles.select}`}
              loadOptions={getCategories}
              onChange={setCategory}
              value={category}
              placeholder="Choose a category"
              clearable={false}
			  valueComponent={Value}
			  optionComponent={Option}
            />
            <Input for="label" placeholder="Libélé de la campagne" />
            <Label>Image:</Label>
            <Row style={{marginBottom: 20}}>
              <Col xs="1">
                <img
                  alt=""
                  style={{
                    width: "35px",
                    height: "auto",
                    verticalAlign: "middle",
                  }}
                  src={image}
                />
              </Col>
              <Col xs="11">
                <Button block onClick={() => setImageModalOpen(true)}>
                  Choisir une image
                </Button>
              </Col>
            </Row>
            <Row>
              <Col md="6">
                <Label>Date de début</Label>
                <Datetime
                  inputProps={{
                    placeholder: "Choisissez la date de début",
                    style: {marginBottom: 20},
                  }}
                  defaultValue={since}
                  onChange={setSince}
                />
              </Col>
              <Col md="6">
                <Label>Date limite</Label>
                <Datetime
                  inputProps={{placeholder: "Choisissez la date limite"}}
                  defaultValue={until}
                  onChange={setUntil}
                />
              </Col>
            </Row>
			<Row>
			{edit ? undefined :
			<div>
				<Col md="6">
					<Label>Nombre d'offres</Label>
					<Select.Async
               className="ads-filter__select"
              loadOptions={getPacks}
			  filterOption={() => (true)}
              onChange={setPacks}
              value={pack}
              placeholder="Choose a Pack"
              clearable={false}
			  valueComponent={Value}
			  optionComponent={Option}
            />
					
				</Col>
				<Col md="6">
					<Label>Nombre personnalisé</Label>
					{pack.pers ?
					<input type="number" onChange={persoff} min="0" placeholder="Personnalisé" />
					:
					<input disabled type="number" value={persoffv} onChange={persoff} min="0" placeholder="Personnalisé" />
					}
					
				</Col>
			</div>
			}
			</Row>
			{edit ? null : 
			<div>
			<Row>
				<Col>
					<Label>Vous obtiendrez {(pack.pers) ?  persoffv : pack.amount} offres et dépenserez {(pack.pers) ? pack.price*parseInt(persoffv, 10) : pack.price}€</Label>
				</Col>
			</Row>
			<Row>
				<Col>
					<Label>Vous pourrez placer une publicité (image ou vidéo), une fois la campagne crée, en éditant cette dernière</Label>
				</Col>
			</Row>
			</div>
			}
            {edit
              ? <FormGroup check>
                  <Label check>
                    <RealInput
                      type="checkbox"
                      value={updateCode}
                      onChange={() => setUpdateCode(!updateCode)}
                    />{" "}
                    Mettre à jour le code
                  </Label>
                </FormGroup>
              : undefined}
            <Submit block style={{marginTop: 20}} color="primary">
              {edit ? "Modifier la campagne" : "Créer la campagne"}
            </Submit>
            {edit &&
              <Row style={{marginTop: 20}}>
				<Col md="6" style={{marginTop: 10}}>
					<Button block onClick={() => setUploadModalOpen(true)}>
						Publicité
                  </Button>
				</Col>
				<Col md="6" style={{marginTop: 10}}>
                  <Button block onClick={cloneOffer}>
                    Cloner l'offre
                  </Button>
				  </Col>
              </Row>}
          </div>}
      </Form>
    </ModalBody>
  </Modal>

const mapState = state => ({user: state.me.user})

export default compose(
  connect(mapState),
  withImageState,
  withCategoryState,
  withPackState,
  withDateState,
  withSinceState,
  withImageModalState,
  withUpdateCodeState,
  withUploadAdModalState,
  mapProps(mapDefaults),
  mapProps(mapSetCategory),
  mapProps(mapSetPacks),
)(CreateOfferModal)
