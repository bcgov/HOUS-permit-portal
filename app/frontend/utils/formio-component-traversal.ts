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
  console.log(completedSections)
  return completedSections
}
