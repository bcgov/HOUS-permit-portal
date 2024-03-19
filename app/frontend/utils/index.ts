import * as humps from "humps"
import * as R from "ramda"
import { EAutoComplianceModule } from "../types/enums"
import { isUUID, removePrefix } from "./utility-functions"

const SUBMISSION_DATA_PREFIX = "formSubmissionData"
const FORMIO_SECTION_REGEX = /^section[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const SECTION_COMPLETION = "section-completion-key"
export const AUTO_COMPLIANCE_OPTIONS_MAP_KEY_PREFIX = "compliance-options-map-prefix-"

export const camelizeResponse = (data: { [key: string]: any }) => {
  /**
   * Helper function to process each object recursively.
   *
   * @param obj - The current object or value being processed.
   * @param underSubmissionData - Flag indicating if the current path is under "submission_data".
   * @returns The processed object or value.
   */
  const process = (obj: any, underSubmissionData = false): any => {
    if (Array.isArray(obj)) {
      // If the object is an array, process each element.
      return obj.map((item) => process(item, underSubmissionData))
    } else if (obj !== null && typeof obj === "object") {
      // If the object is a non-null object, process its keys.
      return Object.keys(obj).reduce((acc, key) => {
        const value = obj[key]
        const isSubmissionData = key === "submission_data"

        // Determine whether to camelize the key.
        const newKey =
          underSubmissionData || key
            ? key // If under "submission_data", keep the key as is.
            : humps.camelize(key, (key, convert) => {
                if (key.startsWith(AUTO_COMPLIANCE_OPTIONS_MAP_KEY_PREFIX)) {
                  return removePrefix(key, AUTO_COMPLIANCE_OPTIONS_MAP_KEY_PREFIX)
                }

                // Conditions to keep the key unchanged.
                return isUUID(key) ||
                  Object.values(EAutoComplianceModule).includes(key) ||
                  key === SECTION_COMPLETION ||
                  key.startsWith(SUBMISSION_DATA_PREFIX) ||
                  FORMIO_SECTION_REGEX.test(key)
                  ? key
                  : convert(key) // Otherwise, camelize the key.
              })

        // Recursively process the value, updating the flag if current key is "submission_data".
        acc[newKey] = process(value, underSubmissionData || isSubmissionData)
        return acc
      }, {} as any)
    } else {
      // For primitive values, return as is.
      return obj
    }
  }

  return process(data)
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
