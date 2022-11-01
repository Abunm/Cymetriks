import Joi from "joi"

import countries from "../constants/countries"
import {allRequired, formType} from "./lib"

// define types
export const companyName = Joi.string().max(20)::formType("text")
export const email = Joi.string().email()::formType("text")
export const zipcode = Joi.string().max(10)::formType("text")
export const password = Joi.string().alphanum().min(5)::formType("password")
export const country = Joi.any().valid(countries)::formType("text")
export const shopAddress = Joi.string()::formType("text")

export const forUpdate = {
  companyName,
  email,
  zipcode,
  password,
  confirmPassword: password,
  country,
  shopAddress,
}

export const forCreate = allRequired(forUpdate)

export const forLogin = allRequired({
  email,
  password,
})
