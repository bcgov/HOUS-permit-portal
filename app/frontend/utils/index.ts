import * as humps from "humps"
import * as R from "ramda"

const SUBMISSION_DATA_REGEX = /^formSubmissionData/

export const camelizeResponse = (data: { [key: string]: any }) => {
  return humps.camelizeKeys(data, function (key, convert) {
    return SUBMISSION_DATA_REGEX.test(key) ? key : convert(key)
  })
}

export const decamelizeRequest = (params: { [key: string]: any }) => {
  return humps.decamelizeKeys(params, function (key, convert, options) {
    return SUBMISSION_DATA_REGEX.test(key) ? key : convert(key)
  })
}

export const isNilOrEmpty = (val) => {
  return R.isNil(val) || R.isEmpty(val)
}
