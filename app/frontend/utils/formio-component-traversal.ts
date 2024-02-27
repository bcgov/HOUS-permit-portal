import * as R from "ramda"
const findPanelComponents = (components) => {
  let panelComponents = []

  // Function to recursively traverse the components
  function traverseComponents(subComponents) {
    subComponents.forEach((container) => {
      // Check if the component type is 'panel'
      if (container.component.type === "panel") {
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

export const combineComplianceHints = (formJson, formattedComplianceData) => {
  let updatedJson = formJson
  for (const [key, value] of Object.entries(formattedComplianceData)) {
    const section = key.split("|")[0].replace("formSubmissionDataRST", "")
    const rb = key.split("|").slice(0, 2).join("|")

    const sectionIndex = updatedJson?.["components"]?.findIndex((c) => c["key"] == section)
    const rbIndex = updatedJson?.["components"]?.[sectionIndex]?.["components"]?.findIndex((c) => c["key"] == rb)
    const itemIndex = updatedJson?.["components"]?.[sectionIndex]?.["components"]?.[rbIndex]?.["components"]?.findIndex(
      (c) => c["key"] == key
    )

    const defaultDesc =
      updatedJson?.["components"]?.[sectionIndex]?.["components"]?.[rbIndex]?.["components"]?.[itemIndex]?.[
        "description"
      ]

    if (defaultDesc) {
      const combinedValue = value
      updatedJson["components"][sectionIndex]["components"][rbIndex]["components"][itemIndex]["description"] =
        combinedValue
    }
  }
  return updatedJson
}
