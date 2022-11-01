import React, {Component} from "react"
import {
  FormGroup,
  Input as ReactstrapInput,
  Label,
  FormFeedback,
} from "reactstrap"
import {withFormValue} from "react-forms"
import prettyMessage from "../../schemas/pretty-message"

class Input extends Component {
  onChange(e) {
    this.props.formValue.update(e.target.value)
  }

  render() {
    const {formValue, label, ...props} = this.props
    const [error] = formValue.errorList
    const color = error ? "danger" : undefined
    return (
      <FormGroup color={color}>
        <Label>
          {label}
        </Label>
        <ReactstrapInput
          state={color}
          value={formValue.value}
          onChange={::this.onChange}
          {...props}
        />
        {error
          ? <FormFeedback>
              {prettyMessage(label, error)}
            </FormFeedback>
          : undefined}
      </FormGroup>
    )
  }
}

export default withFormValue(Input)
