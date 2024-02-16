import * as humps from "humps"
import * as R from "ramda"

const SUBMISSION_DATA_PREFIX = "formSubmissionData"
const FORMIO_SECTION_REGEX = /^section[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export const camelizeResponse = (data: { [key: string]: any }) => {
  return humps.camelizeKeys(data, function (key, convert) {
    return key.startsWith(SUBMISSION_DATA_PREFIX) || FORMIO_SECTION_REGEX.test(key) ? key : convert(key)
  })
}

export const decamelizeRequest = (params: { [key: string]: any }) => {
  return humps.decamelizeKeys(params, function (key, convert, options) {
    return key.startsWith(SUBMISSION_DATA_PREFIX) ? key : convert(key)
  })
}

export const isNilOrEmpty = (val) => {
  return R.isNil(val) || R.isEmpty(val)
}
