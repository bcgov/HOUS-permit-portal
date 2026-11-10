const HIDDEN_ELECTIVE_SUFFIX = ";show = false"
const OPTIONAL_BLOCK_CONFIRMATION_CLASS = "optional-block-confirmation-checkbox"

type ElectiveComponent = {
  id?: string
  elective?: boolean
  customConditional?: string
  customClass?: string
  validate?: { required?: boolean }
}

export const isOptionalBlockConfirmation = (component: { customClass?: string } | null | undefined) =>
  !!component?.customClass?.split(/\s+/).includes(OPTIONAL_BLOCK_CONFIRMATION_CLASS)

// Enabled electives are optional on the requirement until a jurisdiction marks them required.
// That flag is applied here, then the all-optional acknowledgement is dropped if any field is required.
export function applyEnabledElectiveRequirements<T extends ElectiveComponent>(
  components: T[],
  enabledElectiveIds: string[] | undefined,
  optionalElectiveIds: string[] | undefined
): T[] {
  if (!components?.length || !enabledElectiveIds?.length) return components

  for (const component of components) {
    const conditional = component.customConditional
    if (
      !enabledElectiveIds.includes(component?.id) ||
      !component.elective ||
      !conditional?.endsWith(HIDDEN_ELECTIVE_SUFFIX)
    ) {
      continue
    }

    component.customConditional = conditional.slice(0, -HIDDEN_ELECTIVE_SUFFIX.length)
    component.validate ??= {}
    component.validate.required = !optionalElectiveIds?.includes(component.id)
  }

  const hasRequiredField = components.some(
    (component) => !isOptionalBlockConfirmation(component) && !!component.validate?.required
  )
  if (!hasRequiredField) return components

  return components.filter((component) => !isOptionalBlockConfirmation(component))
}
