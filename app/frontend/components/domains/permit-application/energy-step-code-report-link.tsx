export const appendAnchorWithSvgToLabel = (labelSelector: string, anchorUrl: string, svgPathData: string): void => {
  const label = document.querySelector(labelSelector)

  if (label && label instanceof HTMLLabelElement) {
    const setAttributes = (element, attributes) => {
      Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value))
    }

    const anchor = document.createElement("a")
    anchor.href = anchorUrl
    anchor.target = "_blank"

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
    setAttributes(svg, {
      width: "1em",
      style: "display:inline-block; margin-left: 0.25rem",
      height: "1em",
      fill: "currentColor",
      viewBox: "0 0 256 256",
    })
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path")
    path.setAttribute("d", svgPathData)
    svg.appendChild(path)
    anchor.textContent = label.textContent
    anchor.appendChild(svg)
    label.textContent = ""
    label.appendChild(anchor)
  }
}
