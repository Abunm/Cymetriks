import React from 'react'
import Reset from '../components/reset'

export default (props) => (
  <Reset
    {...props}
    apiUrl='/api/users/reset'
    redirectionUrl='winwin://'
  />
)
