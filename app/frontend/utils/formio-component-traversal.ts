import { t } from "i18next"

const findPanelComponents = (components) => {
  let panelComponents = []

  // Function to recursively traverse the components
  function traverseComponents(subComponents) {
    subComponents.forEach((container) => {
      // Check if the component type is 'panel'
      if (container?.component?.type === "panel" || container?.type === "panel") {
        // If it is a panel, add it to the list
        panelComponents.push(container)
      } else if (container.components && container.components.length) {
        // If the component has nested components, traverse them recursively
        traverseComponents(container.components)
      }
    })
  }

  // Start traversing from the top-level components
  traverseComponents(components)

  return panelComponents
}

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
  //jurisdicition-form customizations
  const blocksLookups = templateVersionCustomizationsByJurisdiction?.requirementBlockChanges || {}
  const blocksList = findPanelComponents(updatedJson.components)
  blocksList.forEach((panelComponent) => {
    if (blocksLookups[panelComponent.id]) {
      if (blocksLookups[panelComponent.id]?.tip) {
        panelComponent["tip"] = blocksLookups[panelComponent.id].tip
      }
      if (blocksLookups[panelComponent.id]?.["enabledElectiveFieldIds"]) {
        panelComponent.components.forEach((subComp) => {
          if (subComp.elective && subComp.customConditional.endsWith(";show = false")) {
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
      if (item.computedCompliance != "DigitalSealValidator") {
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
