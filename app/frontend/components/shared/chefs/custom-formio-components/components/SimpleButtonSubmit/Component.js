/* tslint:disable */
import { Components } from "formiojs"
import { Constants } from "../Common/Constants.js"
import editForm from "./Component.form.js"
const ParentComponent = Components.components.button
const ID = "simplebtnsubmit"
const DISPLAY = "Submit Button"
export default class Component extends ParentComponent {
  static schema(...extend) {
    return ParentComponent.schema(
      {
        type: ID,
        label: "Submit",
        key: "submit",
        size: "md",
        leftIcon: "",
        rightIcon: "",
        block: false,
        action: "submit",
        persistent: false,
        disableOnInvalid: true,
        theme: "primary",
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
      icon: "paper-plane",
      weight: 30,
      documentation: Constants.DEFAULT_HELP_LINK,
      schema: Component.schema(),
    }
  }
}
