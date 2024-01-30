import { Quill } from "react-quill"

// from https://stackoverflow.com/questions/59503488/data-attribute-for-image-tag-in-quill

// Allow img to have all attributes passed originally
const ImageBlot = Quill.import("formats/image")

export class CustomImageBlot extends ImageBlot {
  static blotName = "customImage"
  static tagName = "img"

  static create(value) {
    const node: HTMLImageElement = super.create()
    node.setAttribute("alt", value.alt)
    node.setAttribute("src", value.url)

    Object.getOwnPropertyNames(value).forEach((attributeName) => {
      if (attributeName.includes("data-")) {
        node.setAttribute(attributeName, value[attributeName])
      }
    })

    return node
  }

  constructor(domNode: HTMLImageElement, value: any) {
    super(domNode, value)
  }

  static value(node: HTMLImageElement) {
    const blot = {
      alt: node.getAttribute("alt") || "Editor Embedded Image",
      url: node.getAttribute("src"),
    }
    node.getAttributeNames().forEach((attributeName) => {
      if (attributeName.includes("data-")) {
        blot[attributeName] = node.getAttribute(attributeName)
      }
    })

    return blot
  }
}
