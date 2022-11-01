import _ from 'lodash'

export const allRequired = obj => _.mapValues(obj, v => v.required())

export function withRequired(...fields) {
  const clone = {...this}
  for (const field of fields) {
    clone[field].required()
  }
  return clone
}

export function formType(type) {
  if (type) {
    const obj = this.clone()
    obj._flags.formType = type
    return obj
  } else {
    return this._flags.formType
  }
}
