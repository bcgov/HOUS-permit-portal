/* tslint:disable */
import { Components } from "formiojs"
import { Constants } from "../Common/Constants.js"
import editForm from "./Component.form.js"
const ParentComponent = Components.components.button
const ID = "simplebtnreset"
const DISPLAY = "Reset Button"
export default class Component extends ParentComponent {
  static schema(...extend) {
    return ParentComponent.schema(
      {
        type: ID,
        label: "Reset",
        key: "submit",
        size: "md",
        leftIcon: "",
        rightIcon: "",
        block: false,
        action: "reset",
        persistent: false,
        disableOnInvalid: false,
        theme: "secondary",
        dataGridLabel: true,
      },
      ...extend
    )
  }
  static editForm = editForm
  static get builderInfo() {
    return {
      title: DISPLAY,
      group: "simple",
      icon: "undo",
      weight: 31,
      documentation: Constants.DEFAULT_HELP_LINK,
      schema: Component.schema(),
    }
  }
}
