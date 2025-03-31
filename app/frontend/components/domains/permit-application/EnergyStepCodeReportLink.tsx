export const appendAnchorWithSvgToLabel = (labelSelector: string, anchorUrl: string): void => {
  const label = document.querySelector(labelSelector)
  const svgPathData =
    "M224,104a8,8,0,0,1-16,0V59.32l-66.33,66.34a8,8,0,0,1-11.32-11.32L196.68,48H152a8,8,0,0,1,0-16h64a8,8,0,0,1,8,8Zm-40,24a8,8,0,0,0-8,8v72H48V80h72a8,8,0,0,0,0-16H48A16,16,0,0,0,32,80V208a16,16,0,0,0,16,16H176a16,16,0,0,0,16-16V136A8,8,0,0,0,184,128Z"
  if (label && label instanceof HTMLLabelElement) {
    const setAttributes = (element: HTMLElement, attributes: Record<string, string>) => {
      Object.entries(attributes).forEach(([key, value]) => {
        element.setAttribute(key, value)
      })
    }

    const createSvg = (pathData: string): SVGSVGElement => {
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
      setAttributes(svg, {
        width: "1em",
        height: "1em",
        fill: "currentColor",
        style: "display:inline-block; margin-left: 0.25rem",
        viewBox: "0 0 256 256",
      })

      const path = document.createElementNS("http://www.w3.org/2000/svg", "path")
      path.setAttribute("d", pathData)
      svg.appendChild(path)

      return svg
    }

    const createAnchor = (url: string, svg: SVGSVGElement): HTMLAnchorElement => {
      const anchor = document.createElement("a")
      anchor.href = url
      anchor.target = "_blank"
      anchor.appendChild(svg)

      return anchor
    }

    const svg = createSvg(svgPathData)
    const anchor = createAnchor(anchorUrl, svg)

    anchor.textContent = label.textContent || ""

    label.textContent = ""
    label.appendChild(anchor)
  }
}
