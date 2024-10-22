import { t } from "i18next"
import { COMPLETTION_SECTION_ID } from "../constants/formio-constants"
import {
  IFormIOBlock,
  IFormIORequirement,
  IFormIOSection,
  IFormJson,
  IRevisionRequest,
  ITemplateVersionDiff,
} from "../types/types"
import { isNonRequirementKey } from "./formio-helpers"

const findComponentsByType = (components, type) => {
  let foundComponents = []

  // Function to recursively traverse the components
  function traverseComponents(subComponents) {
    subComponents.forEach((component) => {
      if (component?.component?.type === type || component?.type === type) {
        // If the component matches the type, add it to the list
        foundComponents.push(component)
      } else if (component.components && component.components.length) {
        // If the component has nested components, traverse them recursively
        traverseComponents(component.components)
      }
    })
  }

  traverseComponents(components)
  return foundComponents
}

const findPanelComponents = (components) => findComponentsByType(components, "panel")
const findFileComponents = (components) => findComponentsByType(components, "simplefile")

export const getNestedComponentsIncomplete = (components) => {
  //only look at visible objects
  //in a typical object, the dataValue is the actual value selected
  //in a multi select, this is a hash of key values with true / falses
  //in a general_contact, this is a layer of nested fields

  return components
    .filter((comp) => comp._visible)
    .filter((comp) => {
      //in the case of general_contacts, a fieldset has the isValid function
      return comp.error || (comp.component.validate?.required && !comp.isValid(comp.dataValue, true))
    })
}

export const getCompletedBlocksFromForm = (rootComponent) => {
  const blocksList = findPanelComponents(rootComponent.components)
  let completedBlocks = {}
  blocksList.forEach((panelComponent) => {
    const incompleteComponents = getNestedComponentsIncomplete(panelComponent.components)

    const complete = incompleteComponents.length == 0 //if there are any components with errors OR required fields with no value

    return (completedBlocks[panelComponent?.component?.key] = complete)
  })
  return completedBlocks
}

export const combineComplianceHints = (
  formJson,
  templateVersionCustomizationsByJurisdiction,
  formattedComplianceData
) => {
  let updatedJson = formJson
  //special step - utilize the fileKey variable in simplefile to pass the file through, this is done this way to not modify the underlying chefs simplefile implementation
  //currently better than doing on on the requirement_json service as we will likley modify items in the long run
  const fileComponents = findFileComponents(updatedJson.components)
  fileComponents.forEach((fileComponent) => {
    if (fileComponent.multiple) {
      //TODO: For multiple files do something else.  We haven't had a use case or enabled mutiple file uploads yet.
    } else {
      fileComponent["fileKey"] = fileComponent.key
    }
  })

  //jurisdicition-form customizations
  const blocksLookups = templateVersionCustomizationsByJurisdiction?.requirementBlockChanges || {}
  const blocksList = findPanelComponents(updatedJson.components)
  blocksList.forEach((panelComponent) => {
    if (blocksLookups[panelComponent.id]) {
      if (blocksLookups[panelComponent.id]?.tip) {
        panelComponent["tip"] = blocksLookups[panelComponent.id].tip
      }
      const enabledElectiveIds = blocksLookups[panelComponent.id]?.["enabledElectiveFieldIds"]

      if (enabledElectiveIds) {
        panelComponent.components.forEach((subComp) => {
          if (
            enabledElectiveIds?.includes(subComp?.id) &&
            subComp.elective &&
            subComp.customConditional.endsWith(";show =" + " false")
          ) {
            //remove the ;show = false at the end of the conditional
            subComp.customConditional = subComp.customConditional.slice(0, -13)
          }
        })
      }

      for (const [key, value] of Object.entries(blocksLookups[panelComponent.id])) {
        panelComponent[key] = value
      }
    }
  })

  if (!formattedComplianceData) return updatedJson

  //compliance data logic
  for (const [key, value] of Object.entries(formattedComplianceData)) {
    const section = key.split("|")[0].replace("formSubmissionDataRST", "")
    const rb = key.split("|").slice(0, 2).join("|")

    // Find the indexes of section and rb once and directly access the item
    let item = updatedJson.components
      ?.find((c) => c.key === section)
      ?.components?.find((c) => c.key === rb)
      ?.components?.find((c) => c.key === key)

    // Note the result is either a string or a object, to be handled by the renderer
    if (item && item.computedCompliance) {
      item.computedComplianceResult = value
      if (item.computedCompliance?.module != "DigitalSealValidator") {
        //there is no default value for a file
        item.defaultValue = value
      }
    }
    if (item && item.energyStepCode) {
      item.label = t("formComponents.energyStepCode.edit")
      item.title = t("formComponents.energyStepCode.edit")
      if (value == "warningFileOutOfDate") {
        item.energyStepCodeWarning = t("formComponents.energyStepCode.warningFileOutOfDate")
      }
    }
  }

  return updatedJson
}

const updateFormJsonClasses = (formJson: IFormJson, idsMap: { [key: string]: string[] }) => {
  formJson.components.forEach((section: IFormIOSection) => {
    section.components.forEach((block: IFormIOBlock) => {
      block.components.forEach((requirement: IFormIORequirement) => {
        const classes = requirement.customClass?.split(" ") || []
        Object.keys(idsMap).forEach((key) => {
          const index = classes.indexOf(key)
          if (idsMap[key].includes(requirement.id)) {
            if (index === -1) classes.push(key)
          } else {
            if (index > -1) classes.splice(index, 1)
          }
        })

        requirement.customClass = classes.filter(Boolean).join(" ")
      })
    })
  })
  return formJson
}

export const combineRevisionAnnotations = (formJson: IFormJson, revisionRequests: IRevisionRequest[]) => {
  const revisionIds = revisionRequests.map((rr) => rr.requirementJson.id)
  return updateFormJsonClasses(formJson, { "revision-requested": revisionIds })
}

export const combineDiff = (formJson: IFormJson, diff: ITemplateVersionDiff) => {
  const removedIds = diff?.removed?.map((req) => req.id) || []
  const addedIds = diff?.added?.map((req) => req.id) || []
  const changedIds = diff?.changed?.map((req) => req.id) || []

  return updateFormJsonClasses(formJson, {
    "removed-in-diff": removedIds,
    "added-in-diff": addedIds,
    "changed-in-diff": changedIds,
  })
}

const convertToRevisionButton = (requirement: IFormIORequirement) => {
  return {
    id: requirement.id + "-revision-button",
    key: requirement.key + "-revision-button",
    type: "button",
    label: "",
    title: "Revision Button",
    input: true,
    action: "custom",
    custom: `document.dispatchEvent(new CustomEvent('openRequestRevision', { detail: { key: '${requirement.key}' } } ));`,
    customClass: "revision-button",
    hideLabel: true,
    persistent: "client-only",
    customConditional: requirement.customConditional,
    conditional: requirement.conditional,
  } as IFormIORequirement
}

const convertToChangeMarker = (requirement: IFormIORequirement) => {
  return {
    id: requirement.id + "-submission-change-marker",
    key: requirement.key + "-submission-change-marker",
    type: "button",
    label: "",
    title: "ANSWER CHANGED",
    input: true,
    action: "custom",
    custom: `document.dispatchEvent(new CustomEvent('openPreviousSubmission', { detail: { key: '${requirement.key}' } } ));`,
    customClass: "submission-change-marker",
    hideLabel: true,
    persistent: "client-only",
    // customConditional: `${requirement.customConditional}; show = true;`,
    customConditional: `show = true;`,
    conditional: requirement.conditional,
  } as IFormIORequirement
}

export const combineRevisionButtons = (
  formJson: IFormJson,
  isInReview: boolean,
  revisionRequests?: IRevisionRequest[]
): IFormJson => {
  const revisionRequestRequirementKeys = revisionRequests?.map((rr) => rr.requirementJson.key) || []
  formJson.components.forEach((section: IFormIOSection) => {
    section.components.forEach((block: IFormIOBlock) => {
      for (let i = 0; i < block.components.length; i++) {
        const requirement = block.components[i]

        if (isNonRequirementKey(requirement.key)) continue
        if (section.id === COMPLETTION_SECTION_ID) continue

        if (revisionRequestRequirementKeys.includes(requirement.key) || isInReview) {
          const revisionButton = convertToRevisionButton(requirement)
          // Insert the revision button before the current requirement
          block.components.splice(i, 0, revisionButton)
          // Move the index to the next requirement to skip the newly added revision button
          i++
        }
      }
    })
  })
  return formJson
}

export const combineChangeMarkers = (formJson: IFormJson, isInReview: boolean, changedKeys: string[]): IFormJson => {
  formJson.components.forEach((section: IFormIOSection) => {
    section.components.forEach((block: IFormIOBlock) => {
      for (let i = 0; i < block.components.length; i++) {
        const requirement = block.components[i]
        requirement.disabled ||= isInReview
        if (section.id === COMPLETTION_SECTION_ID || !changedKeys.includes(requirement.key)) continue

        const changeMarker = convertToChangeMarker(requirement)
        // Insert the revision button before the current requirement
        block.components.splice(i, 0, changeMarker)
        // Move the index to the next requirement to skip the newly added marker
        i++
      }
    })
  })
  return formJson
}

export const getRequirementByKey = (formJson: IFormJson, requirementKey: string) => {
  let foundRequirement: IFormIORequirement = null

  traverseFormIORequirements(formJson, (requirement) => {
    if (requirement.key === requirementKey) foundRequirement = requirement
  })

  return foundRequirement
}

export const traverseFormIORequirements = (
  formJson: IFormJson,
  callback: (requirement: IFormIORequirement) => void
) => {
  formJson.components.forEach((section: IFormIOSection) => {
    section.components.forEach((block: IFormIOBlock) => {
      block.components.forEach((requirement: IFormIORequirement) => {
        callback(requirement)
      })
    })
  })
}

export const processFieldsForEphemeral = (formJson: IFormJson) => {
  traverseFormIORequirements(formJson, (requirement) => {
    if (["simplefile"].includes(requirement.type) || ["submit"].includes(requirement.key)) {
      requirement.disabled = true
    }
    requirement.conditional = false
    requirement.customConditional = null
  })
  return formJson
}
