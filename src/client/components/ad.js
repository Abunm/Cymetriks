import React, {Component} from "react"

const style = {
  maxWidth: "100%",
  marginBottom: 10,
}

class Ad extends Component {
  state = {
    type: "none",
  }

  getType(file) {
    if (file.type === "video/mp4") {
      this.setState({type: "video"})
    } else {
      this.setState({type: "image"})
    }
  }

  componentWillUpdate(nextProps) {
    if (nextProps.file !== this.props.file) {
      this.getType(nextProps.file)
    }
  }

  renderMedia(type, src) {
    return type === "video"
      ? <video src={src} controls style={style} />
      : <img src={src} style={style} alt="" />
  }

  render() {
    const {file, initialValues} = this.props
    const {type} = this.state
    if (file) {
      return this.renderMedia(type, file.preview)
    } else if (initialValues && initialValues.ad) {
      return this.renderMedia(initialValues.adType, initialValues.ad)
    } else {
      return <div />
    }
  }
}

export default Ad
