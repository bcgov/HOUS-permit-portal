import * as R from "ramda"
import { IOptionalElectiveFieldInfo } from "../types/types"

const normalizeOptionalText = (value: unknown): string | undefined => {
  if (typeof value !== "string") return undefined
  const trimmed = value.trim()
  return trimmed ? trimmed : undefined
}

export const collectOptionalElectives = (root: any): IOptionalElectiveFieldInfo[] => {
  const electives: IOptionalElectiveFieldInfo[] = []
  const byLabel = new Map<string, IOptionalElectiveFieldInfo>()

  const pushElective = (incoming: IOptionalElectiveFieldInfo) => {
    const label = normalizeOptionalText(incoming.label)
    if (!label) return

    const existing = byLabel.get(label)
    if (!existing) {
      const next: IOptionalElectiveFieldInfo = { label }
      const tooltip = normalizeOptionalText(incoming.tooltip)
      const description = normalizeOptionalText(incoming.description)
      if (tooltip) next.tooltip = tooltip
      if (description) next.description = description
      byLabel.set(label, next)
      electives.push(next)
      return
    }

    // Prefer to fill in any missing details if we see another field with the same label.
    if (!existing.tooltip) {
      const tooltip = normalizeOptionalText(incoming.tooltip)
      if (tooltip) existing.tooltip = tooltip
    }
    if (!existing.description) {
      const description = normalizeOptionalText(incoming.description)
      if (description) existing.description = description
    }
  }

  const visit = (component: any) => {
    if (!component) return

    if (component.elective === true) {
      pushElective({
        label: component.label ?? component.title,
        tooltip: component.tooltip,
        description: component.description,
      })
    }

    if (Array.isArray(component.components)) {
      component.components.forEach(visit)
    }

    if (Array.isArray(component.columns)) {
      component.columns.forEach((col) => {
        if (Array.isArray(col?.components)) col.components.forEach(visit)
        if (Array.isArray(col?.component?.components)) col.component.components.forEach(visit)
      })
    }

    if (Array.isArray(component.rows)) {
      component.rows.forEach((row) => {
        if (!Array.isArray(row)) return
        row.forEach((cell) => {
          if (Array.isArray(cell?.components)) cell.components.forEach(visit)
        })
      })
    }
  }

  if (Array.isArray(root?.components)) {
    root.components.forEach(visit)
  }

  return electives
}

export const getOptionalElectivesByPanelId = (root: any) => {
  // Includes `labels` for backwards compatibility with earlier UI/state shapes.
  const map = new Map<string, { blockTitle?: string; labels: string[]; electives: IOptionalElectiveFieldInfo[] }>()

  const visit = (component: any) => {
    if (!component) return

    if (component.type === "panel" && component.id) {
      const electives = collectOptionalElectives(component)
      map.set(component.id, {
        blockTitle: component.title ?? component.label,
        labels: electives.map((e) => e.label),
        electives,
      })
    }

    if (Array.isArray(component.components)) component.components.forEach(visit)
    if (Array.isArray(component.columns)) {
      component.columns.forEach((col: any) => {
        if (Array.isArray(col?.components)) col.components.forEach(visit)
        if (Array.isArray(col?.component?.components)) col.component.components.forEach(visit)
      })
    }
    if (Array.isArray(component.rows)) {
      component.rows.forEach((row: any) => {
        if (!Array.isArray(row)) return
        row.forEach((cell: any) => {
          if (Array.isArray(cell?.components)) cell.components.forEach(visit)
        })
      })
    }
  }

  if (Array.isArray(root?.components)) {
    root.components.forEach(visit)
  }

  return map
}

export const injectOptionalElectivesButtons = (root: any, buttonLabel: string) => {
  const cloned = R.clone(root)

  const injectIntoPanels = (component: any) => {
    if (!component) return

    if (component.type === "panel" && component.id) {
      const electives = collectOptionalElectives(component)
      if (!electives.length) {
        // No `elective: true` fields in this requirement block; don't add the button.
        // Still recurse to support unexpected nested panels.
      } else {
        const buttonKey = `${component.id}-view-optional-electives`
        const alreadyHasButton =
          Array.isArray(component.components) && component.components.some((c: any) => c?.key === buttonKey)

        if (!alreadyHasButton) {
          component.components ||= []
          component.components.unshift({
            id: buttonKey,
            key: buttonKey,
            type: "button",
            input: true,
            action: "custom",
            label: buttonLabel,
            customClass: "optional-electives-button btn btn-primary",
            custom: `document.dispatchEvent(new CustomEvent('openOptionalElectives', { detail: { panelId: '${component.id}' } }));`,
          })
        }
      }
    }

    if (Array.isArray(component.components)) component.components.forEach(injectIntoPanels)
    if (Array.isArray(component.columns)) {
      component.columns.forEach((col: any) => {
        if (Array.isArray(col?.components)) col.components.forEach(injectIntoPanels)
        if (Array.isArray(col?.component?.components)) col.component.components.forEach(injectIntoPanels)
      })
    }
    if (Array.isArray(component.rows)) {
      component.rows.forEach((row: any) => {
        if (!Array.isArray(row)) return
        row.forEach((cell: any) => {
          if (Array.isArray(cell?.components)) cell.components.forEach(injectIntoPanels)
        })
      })
    }
  }

  if (Array.isArray(cloned?.components)) {
    cloned.components.forEach(injectIntoPanels)
  }

  return cloned
}
