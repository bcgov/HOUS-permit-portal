import * as R from "ramda"
import { isFieldSetKey } from "./formio-helpers"

export const getSinglePreviousSubmissionJson = (submissionData: any, requirementKey: string) => {
  if (isFieldSetKey(requirementKey)) {
    const sectionKeys = Object.keys(submissionData.data)

    for (let i = 0; i < sectionKeys.length; i++) {
      const sectionKey = sectionKeys[i]
      const section = submissionData.data[sectionKey]

      const filteredObject = Object.keys(section).reduce((reducedObject, currentKey) => {
        if (!currentKey.startsWith(requirementKey)) return reducedObject

        reducedObject[currentKey] = section[currentKey]
        return reducedObject
      }, {})

      if (!R.isEmpty(filteredObject)) {
        return { data: filteredObject }
      }
    }
  } else {
    const sectionKeys = Object.keys(submissionData.data)

    for (let i = 0; i < sectionKeys.length; i++) {
      const sectionKey = sectionKeys[i]

      if (submissionData.data[sectionKey][requirementKey]) {
        const foundSubmission = submissionData.data[sectionKey][requirementKey]
        return { data: { [requirementKey]: foundSubmission } }
      }
    }
  }
}
