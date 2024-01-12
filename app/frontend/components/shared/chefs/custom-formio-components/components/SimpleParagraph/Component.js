/* tslint:disable */
import { Components } from "formiojs"
import { Constants } from "../Common/Constants.js"
import editForm from "./Component.form.js"
const ParentComponent = Components.components.htmlelement
const ID = "simpleparagraph"
const DISPLAY = "Paragraph"
export default class Component extends ParentComponent {
  static schema(...extend) {
    return ParentComponent.schema(
      {
        type: ID,
        label: DISPLAY,
        key: ID,
        tag: "p",
        attrs: [],
        content: "",
        input: false,
        persistent: false,
      },
      ...extend
    )
  }
  static editForm = editForm
  static get builderInfo() {
    return {
      title: DISPLAY,
      group: "simple",
      icon: "paragraph",
      weight: 42,
      documentation: Constants.DEFAULT_HELP_LINK,
      schema: Component.schema(),
    }
  }
}
