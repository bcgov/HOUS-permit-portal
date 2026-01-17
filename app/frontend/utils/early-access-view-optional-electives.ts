import * as R from "ramda"

export const collectOptionalElectiveLabels = (root: any): string[] => {
  const labels: string[] = []
  const seen = new Set<string>()

  const pushLabel = (label: unknown) => {
    if (typeof label !== "string") return
    const trimmed = label.trim()
    if (!trimmed) return
    if (seen.has(trimmed)) return
    seen.add(trimmed)
    labels.push(trimmed)
  }

  const visit = (component: any) => {
    if (!component) return

    if (component.elective === true) {
      pushLabel(component.label ?? component.title)
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

  return labels
}

export const getOptionalElectivesByPanelId = (root: any) => {
  const map = new Map<string, { blockTitle?: string; labels: string[] }>()

  const visit = (component: any) => {
    if (!component) return

    if (component.type === "panel" && component.id) {
      map.set(component.id, {
        blockTitle: component.title ?? component.label,
        labels: collectOptionalElectiveLabels(component),
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
      const electiveLabels = collectOptionalElectiveLabels(component)
      if (!electiveLabels.length) {
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
