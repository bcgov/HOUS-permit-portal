export const setupEnergyStepCodeReportLink = () => {
  const handleLabelClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement
    const label = target.closest("label")
    if (label) {
      const tooltip = label.querySelector("i[data-tooltip]")
      if (tooltip) {
        const url = tooltip.getAttribute("data-tooltip")
        if (url) {
          window.open(url, "_blank", "noopener,noreferrer")
        }
      }
    }
  }

  const labelSelector = document.querySelectorAll("div[class*='energy_step_code_report_file'] label")
  labelSelector.forEach((label) => {
    label.addEventListener("click", handleLabelClick)
  })
  