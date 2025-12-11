import { t } from "i18next"
import { COMPLETTION_SECTION_ID } from "../constants/formio-constants"
import {
  IFormIOBlock,
  IFormIORequirement,
  IFormIOSection,
  IFormJson,
  IResource,
  IRevisionRequest,
  ITemplateVersionDiff,
} from "../types/types"
import { formatFileSize, getFileExtension } from "./file-utils"
import { isNonRequirementKey } from "./formio-helpers"
import { escapeForSingleQuotedJsString } from "./utility-functions"

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

  const visibleComponents = components.filter((comp) => comp._visible)

  // Filter out buttons *before* checking validity
  // Note: Adjust property access (comp.type vs comp.component.type) if needed based on your component structure
  const visibleInputComponents = visibleComponents.filter(
    (comp) => comp.type !== "button" && comp.component?.type !== "button"
  )

  const invalidComponents = visibleInputComponents.filter((comp) => {
    //in the case of general_contacts, a fieldset has the isValid function
    const hasError = comp.error
    // Check if comp.component exists before accessing validate
    const isRequired = comp.component?.validate?.required
    // Check if isValid method exists before calling it
    const isValidCheck = typeof comp.isValid === "function" ? !comp.isValid(comp.dataValue, true) : false
    const isRequiredButInvalid = isRequired && isValidCheck

    return hasError || isRequiredButInvalid
  })

  return invalidComponents
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

/**
 * Generate FormIO components for jurisdiction resources
 * Similar to documents_component in requirement_block.rb
 */
const generateResourceComponents = (resourcesByCategory: Record<string, IResource[]>, blockId: string): any[] => {
  const components: any[] = []

  // Add components for each category
  Object.entries(resourcesByCategory).forEach(([category, resources]) => {
    // Category label - category is in snake_case, matching the i18n keys
    const categoryLabel: string = (t as any)(`jurisdiction.resources.categories.${category}`)
    const resourcesText: string = ((t as any)("home.configurationManagement.resources.title") as string).toLowerCase()
    components.push({
      type: "content",
      key: `${blockId}-resource-category-${category}`,
      html: `<p style="font-weight: 600; font-size: 16px; color: var(--chakra-colors-text-secondary); margin: 8px 0 4px 0;">${categoryLabel} ${resourcesText}</p>`,
    })

    // Individual resources
    resources.forEach((resource) => {
      if (resource.resourceType === "link") {
        components.push({
          type: "button",
          key: `${blockId}-resource-${resource.id}`,
          action: "custom",
          customClass: "resource-link-button",
          label: resource.title,
          custom: `document.dispatchEvent(new CustomEvent('openResourceLink', {
            detail: { url: '${escapeForSingleQuotedJsString(resource.linkUrl)}', title: '${escapeForSingleQuotedJsString(resource.title)}' }
          }));`,
        })
      } else if (resource.resourceDocument) {
        const fileExt = getFileExtension(
          resource.resourceDocument.file?.metadata?.filename,
          resource.resourceDocument.file?.metadata?.mimeType
        )
        const fileSize = formatFileSize(resource.resourceDocument.file?.metadata?.size)
        const label = `${resource.title} (${fileExt}, ${fileSize})`

        components.push({
          type: "button",
          key: `${blockId}-resource-${resource.id}`,
          action: "custom",
          customClass: "resource-document-download-button",
          label: label,
          custom: `document.dispatchEvent(new CustomEvent('downloadResourceDocument', {
            detail: {
              id: '${resource.resourceDocument.id}',
              filename: '${escapeForSingleQuotedJsString(resource.resourceDocument.file?.metadata?.filename)}'
            }
          }));`,
        })
      }

      // Description if present
      if (resource.description) {
        components.push({
          type: "content",
          key: `${blockId}-resource-${resource.id}-desc`,
          html: `<p style="font-size: 14px; color: var(--chakra-colors-text-secondary); margin: 4px 0 8px 0;">${resource.description}</p>`,
        })
      }
    })
  })

  return components
}

export const combineCustomizations = (
  formJson,
  templateVersionCustomizationsByJurisdiction,
  formattedComplianceData,
  jurisdictionResources?: IResource[]
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
      const optionalElectiveIds = blocksLookups[panelComponent.id]?.["optionalElectiveFieldIds"]

      if (enabledElectiveIds) {
        panelComponent.components.forEach((subComp) => {
          if (
            enabledElectiveIds?.includes(subComp?.id) &&
            subComp.elective &&
            subComp.customConditional.endsWith(";show =" + " false")
          ) {
            //remove the ;show = false at the end of the conditional
            subComp.customConditional = subComp.customConditional.slice(0, -13)

            // Handle optional/required status
            if (subComp.validate) {
              subComp.validate.required = !optionalElectiveIds?.includes(subComp.id)
            }
          }
        })
      }

      // Inject resource components if resourceIds are present
      const resourceIds = blocksLookups[panelComponent.id]?.["resourceIds"]
      if (resourceIds && resourceIds.length > 0 && jurisdictionResources) {
        const resources = jurisdictionResources.filter((r) => resourceIds.includes(r.id))

        if (resources.length > 0) {
          // Group filtered resources by category
          const grouped: Record<string, IResource[]> = {}
          resources.forEach((resource) => {
            if (!grouped[resource.category]) grouped[resource.category] = []
            grouped[resource.category].push(resource)
          })

          // Generate FormIO components for each category
          const resourceComponents = generateResourceComponents(grouped, panelComponent.id)

          // Inject components at the beginning of panelComponent.components
          panelComponent.components.unshift(...resourceComponents)
        }
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
      const energyStepCodeLabel: string = (t as any)("formComponents.energyStepCode.edit")
      item.label = energyStepCodeLabel
      item.title = energyStepCodeLabel
      if (value == "warningFileOutOfDate") {
        item.energyStepCodeWarning = (t as any)("formComponents.energyStepCode.warningFileOutOfDate")
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
    custom: `document.dispatchEvent(new CustomEvent('openRequestRevision', { detail: { key: '${escapeForSingleQuotedJsString(requirement.key || "")}' } } ));`,
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
    custom: `document.dispatchEvent(new CustomEvent('openPreviousSubmission', { detail: { key: '${escapeForSingleQuotedJsString(requirement.key || "")}' } } ));`,
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

export const findPidComponentKey = (component: any) => {
  if (component.key && component.key.endsWith("|pid")) {
    return component.key
  }

  if (component.components) {
    for (const child of component.components) {
      const key = findPidComponentKey(child)
      if (key) return key
    }
  }

  if (component.columns) {
    for (const column of component.columns) {
      const key = findPidComponentKey(column)
      if (key) return key
    }
  }

  return null
}
