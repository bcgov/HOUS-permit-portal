import { Quill } from "react-quill"

// Allow img to have all attributes passed originally
const Inline = Quill.import("blots/inline")

export class CustomLinkBlot extends Inline {
  static blotName = "link"
  static tagName = "a"

  static create(value) {
    let node: HTMLAnchorElement = super.create()

    node.setAttribute("href", value?.href)
    node.setAttribute("target", "_blank")
    node.setAttribute("rel", "noopener noreferrer")

    Object.getOwnPropertyNames(value).forEach((attributeName) => {
      if (attributeName.includes("data-")) {
        node.setAttribute(attributeName, value[attributeName])
      }
    })

    return node
  }

  static value(node: HTMLAnchorElement) {
    const val = {
      href: node.getAttribute("href"),
      target: node.getAttribute("target"),
      rel: node.getAttribute("rel"),
    }

    node.getAttributeNames().forEach((attributeName) => {
      if (attributeName.includes("data-")) {
        val[attributeName] = node.getAttribute(attributeName)
      }
    })

    return val
  }

  static formats(node: HTMLAnchorElement) {
    const val = {
      href: node.getAttribute("href"),
    }

    node.getAttributeNames().forEach((attributeName) => {
      if (attributeName.includes("data-")) {
        val[attributeName] = node.getAttribute(attributeName)
      }
    })

    return val
  }
}
