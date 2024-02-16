import * as humps from "humps"
import * as R from "ramda"

const SUBMISSION_DATA_PREFIX = "formSubmissionData"
const SECTION_PREFIX = "section"

export const camelizeResponse = (data: { [key: string]: any }) => {
  return humps.camelizeKeys(data, function (key, convert) {
    return key.startsWith(SUBMISSION_DATA_PREFIX) || key.startsWith(SECTION_PREFIX) ? key : convert(key)
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
