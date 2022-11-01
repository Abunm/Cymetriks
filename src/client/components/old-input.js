import React, {Component} from "react"
import {FormGroup, Input as ReactstrapInput} from "reactstrap"
import {css} from "glamor"

export default class Input extends Component {
  render() {
    const {status, ...props} = this.props
    return (
      <FormGroup color={status}>
        {/* Fake input to disable autocomplet */}
        <input {...props} {...css({display: "none"})} />
        <ReactstrapInput {...props} state={status} />
      </FormGroup>
    )
  }
}
