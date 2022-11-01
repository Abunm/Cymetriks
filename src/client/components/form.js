import React, {Component} from "react"
import {Button, Alert} from "reactstrap"
import Joi from "joi"
import axios from "axios"
import _ from "lodash"

import {formType} from "../../types/lib"
import Input from "./old-input"

const getInputs = state =>
  Object.entries(state).filter(([key]) => !_.startsWith(key, "_"))

export default class Form extends Component {
  constructor(...props) {
    super(...props)
    this.state = {
      _loading: false,
      _valid: false,
      _errAlert: null,
    }

    this.innerInput = ({for: forInput, ...props}) =>
      <Input
        {...props}
        type={this.state[forInput].type}
        value={this.state[forInput].value}
        onChange={::this.onChange(forInput)}
        status={this.state[forInput].status}
        name={forInput}
      />

    this.submitButton = ({children, ...props}) =>
      <Button {...props} disabled={!this.state._valid} onClick={::this.submit}>
        {children}
      </Button>
  }

  submit() {
    if (!this.state._valid) {
      return
    }

    const body = {}
    const inputs = getInputs(this.state)
    inputs.forEach(([k, v]) => {
      body[k] = v.value
    })

    const {beforeSubmit} = this.props

    if (beforeSubmit && !beforeSubmit(body)) {
      return
    }

    const method = this.props.method || "post"
    const axiosMethod = axios[method]

    axiosMethod(this.props.url, body)
      .then(res => {
        if (res.status === 200) {
          this.props.onSuccess(res)
        }
      })
      .catch(err => {
        const {data} = err.response
        if (data && data.length && data[0].message) {
          this.setState({_errAlert: data[0].message})
        } else {
          this.setState({_errAlert: "An error occured !"})
        }
      })
  }

  componentWillUpdate(nextProps, nextState) {
    const inputs = getInputs(nextState)

    const valid = inputs.every(([, v]) => v.status === "success")

    if (this.state._valid !== valid) {
      this.setState({_valid: valid})
    }
  }

  componentWillMount() {
    const {schema, defaultValues} = this.props
    const state = {}
    let entries = Object.entries(schema)
    if (this.props.dontValidate) {
      entries = entries.filter(
        ([key]) => !this.props.dontValidate.includes(key),
      )
    }

    for (const [name, validator] of entries) {
      state[name] = {
        value: "",
        validator,
        type: validator::formType(),
        status: null,
      }

      if (defaultValues && defaultValues[name]) {
        setTimeout(() => {
          this.updateValue(name, defaultValues[name])
        })
      }
    }
    this.setState(state)
  }

  updateValue(name, value) {
    const oldInput = this.state[name]
    const {validator} = oldInput

    if (oldInput.type === "number") {
      value = +value
    }

    const {error} = Joi.validate(value, validator)
    const status = error ? "danger" : "success"

    const newInput = {...oldInput, value, status}
    this.setState({[name]: newInput})
  }

  onChange(forInput) {
    return e => {
      this.updateValue(forInput, e.target.value)
    }
  }

  render() {
    return (
      <div>
        <Alert
          color="danger"
          isOpen={!!this.state._errAlert}
          toggle={() => this.setState({_errAlert: null})}
        >
          {this.state._errAlert}
        </Alert>
        {this.props.children(this.innerInput, this.submitButton)}
      </div>
    )
  }
}
