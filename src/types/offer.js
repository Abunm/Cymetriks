import Joi from 'joi'

import {withRequired, formType} from './lib'

export const label = Joi.string()::formType('text')
export const offerCount = Joi.string()::formType('text')

export const offerForUpdate = {
  label,
  offerCount
}

export const offerForCreate = offerForUpdate::withRequired('label')
