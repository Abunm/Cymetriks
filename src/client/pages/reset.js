import React from "react"
import Reset from "../components/reset"

export default props =>
  <Reset
    {...props}
    apiUrl="/api/pros/reset"
    redirectionUrl={`${global.location.protocol}//${global.location
      .host}/login`}
  />
