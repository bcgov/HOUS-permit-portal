import * as R from "ramda"
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

export const getCompletedSectionsFromForm = (rootComponent) => {
  const blocksList = findPanelComponents(rootComponent.components)
  let completedSections = {}
  blocksList.forEach((panelComponent) => {
    const complete =
      panelComponent.components.filter(
        (comp) => comp.error || (comp.component.validate?.required && R.isEmpty(comp.dataValue))
      ).length == 0 //if there are any components with errors OR required fields with no value

    return (completedSections[panelComponent?.component?.key] = complete)
  })
  return completedSections
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

    // Update the description if the item is found
    if (item && item.description) {
      item.description = value
    }
  }
  return updatedJson
}
