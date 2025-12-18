import * as humps from "humps"
import * as R from "ramda"
import { EAutoComplianceModule } from "../types/enums"
import { isUUID, removePrefix } from "./utility-functions"

const SUBMISSION_DATA_KEY = "submission_data"
const SUBMISSION_DATA_KEY_CAMEL = "submissionData"
const FORMATTED_COMPLIANCE_DATA_KEY = "formatted_compliance_data"
const FRONT_END_FORM_UPDATE_KEY = "front_end_form_update"
const FORMIO_SECTION_REGEX = /^section[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const SECTION_COMPLETION = "section-completion-key"
export const AUTO_COMPLIANCE_OPTIONS_MAP_KEY_PREFIX = "compliance-options-map-prefix-"

const recursiveCamelize = (data: any, skipCamelization = false): any => {
  if (Array.isArray(data)) {
    return data.map((item) => recursiveCamelize(item, skipCamelization))
  }

  if (data !== null && typeof data === "object" && data.constructor === Object) {
    const newObject: { [key: string]: any } = {}
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const value = data[key]
        let newKey: string

        // This new logic is to prevent the all of the submission data from being camelized
        // This is so that the submission data always remains in snake_case and matches is structure
        // both upon its creation, and when it is retrieved from the database. Formio cannot adapt to
        // the submission data camelization, so we need to ensure that it remains how it was when it was created.
        // We no longer need to check for any SUBMISSION_DATA_PREFIX since these always exist as children of the submission data
        const skipChildren =
          skipCamelization ||
          key === SUBMISSION_DATA_KEY ||
          key === FORMATTED_COMPLIANCE_DATA_KEY ||
          key === FRONT_END_FORM_UPDATE_KEY

        if (key.startsWith(AUTO_COMPLIANCE_OPTIONS_MAP_KEY_PREFIX)) {
          newKey = removePrefix(key, AUTO_COMPLIANCE_OPTIONS_MAP_KEY_PREFIX)
        } else if (
          skipCamelization ||
          isUUID(key) ||
          Object.values(EAutoComplianceModule).includes(key as EAutoComplianceModule) ||
          key === SECTION_COMPLETION ||
          FORMIO_SECTION_REGEX.test(key)
        ) {
          newKey = key
        } else {
          newKey = humps.camelize(key)
        }
        // This is accomplished using a recursive function that passes down the skipCamelization flag
        newObject[newKey] = recursiveCamelize(value, skipChildren)
      }
    }
    return newObject
  }

  return data
}

const recursiveDecamelize = (data: any, skipDecamelization = false): any => {
  if (Array.isArray(data)) {
    return data.map((item) => recursiveDecamelize(item, skipDecamelization))
  }

  if (data !== null && typeof data === "object" && data.constructor === Object) {
    const newObject: { [key: string]: any } = {}
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const value = data[key]
        let newKey: string

        const skipChildren = skipDecamelization || key === SUBMISSION_DATA_KEY_CAMEL

        if (key.startsWith(AUTO_COMPLIANCE_OPTIONS_MAP_KEY_PREFIX)) {
          newKey = removePrefix(key, AUTO_COMPLIANCE_OPTIONS_MAP_KEY_PREFIX)
        } else if (
          skipDecamelization ||
          isUUID(key) ||
          Object.values(EAutoComplianceModule).includes(key as EAutoComplianceModule) ||
          key === SECTION_COMPLETION ||
          FORMIO_SECTION_REGEX.test(key)
        ) {
          newKey = key
        } else {
          newKey = humps.decamelize(key)
        }

        newObject[newKey] = recursiveDecamelize(value, skipChildren)
      }
    }
    return newObject
  }

  return data
}

export const camelizeResponse = (data: { [key: string]: any }) => {
  return recursiveCamelize(data)
}

export const decamelizeRequest = (params: { [key: string]: any }) => {
  return recursiveDecamelize(params)
}

export const isNilOrEmpty = (val: any): boolean => {
  return R.isNil(val) || R.isEmpty(val)
}

export * from "./file-utils"
