import * as humps from "humps"
import * as R from "ramda"
import { EAutoComplianceModule } from "../types/enums"
import { isUUID, removePrefix } from "./utility-functions"

const SUBMISSION_DATA_PREFIX = "formSubmissionData"
const FORMIO_SECTION_REGEX = /^section[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const SECTION_COMPLETION = "section-completion-key"
export const AUTO_COMPLIANCE_OPTIONS_MAP_KEY_PREFIX = "compliance-options-map-prefix-"

export const camelizeResponse = (data: { [key: string]: any }) => {
  return humps.camelizeKeys(data, function (key, convert, options) {
    if (key.startsWith(AUTO_COMPLIANCE_OPTIONS_MAP_KEY_PREFIX)) {
      return removePrefix(key, AUTO_COMPLIANCE_OPTIONS_MAP_KEY_PREFIX)
    }

    return isUUID(key) ||
      Object.values(EAutoComplianceModule).includes(key) ||
      key == SECTION_COMPLETION ||
      key.startsWith(SUBMISSION_DATA_PREFIX) ||
      FORMIO_SECTION_REGEX.test(key)
      ? key
      : convert(key)
  })
}

export const decamelizeRequest = (params: { [key: string]: any }) => {
  return humps.decamelizeKeys(params, function (key, convert, options, ...rest) {
    if (key.startsWith(AUTO_COMPLIANCE_OPTIONS_MAP_KEY_PREFIX)) {
      return removePrefix(key, AUTO_COMPLIANCE_OPTIONS_MAP_KEY_PREFIX)
    }

    return key == SECTION_COMPLETION || key.startsWith(SUBMISSION_DATA_PREFIX) ? key : convert(key)
  })
}

export const isNilOrEmpty = (val) => {
  return R.isNil(val) || R.isEmpty(val)
}
