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
