import React from 'react'
import Forgot from '../components/forgot'

export default (props) => (
  <Forgot
    {...props}
    apiUrl='/api/users/forgot'
  />
)
