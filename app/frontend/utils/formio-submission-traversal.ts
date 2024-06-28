import * as R from "ramda"
import { isFieldSetKey } from "./formio-helpers"

export const getSinglePreviousSubmissionJson = (submissionData: any, requirementKey: string) => {
  if (isFieldSetKey(requirementKey)) {
    let data = {}
    Object.keys(submissionData.data).forEach((sectionKey) => {
      const section = submissionData.data[sectionKey]
      if (!R.isEmpty(data)) return

      const filteredObject = Object.keys(section)
        .filter((key) => key.startsWith(requirementKey))
        .reduce((filteredObj, key) => {
          filteredObj[key] = section[key]
          return filteredObj
        }, {})

      if (!R.isEmpty(filteredObject)) {
        data = filteredObject
      }
    })
    return { data }
  } else {
    let foundSubmission = null

    Object.keys(submissionData.data).forEach((sectionKey) => {
      if (submissionData.data[sectionKey][requirementKey]) {
        foundSubmission = submissionData.data[sectionKey][requirementKey]
      }
    })
    return { data: { [requirementKey]: foundSubmission } }
  }
}
