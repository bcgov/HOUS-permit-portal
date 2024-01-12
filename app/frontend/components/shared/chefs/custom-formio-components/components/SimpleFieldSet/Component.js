/* tslint:disable */
import { Components } from "formiojs"
import { Constants } from "../Common/Constants.js"
import editForm from "./Component.form.js"
const ParentComponent = Components.components.fieldset
const ID = "simplefieldset"
const DISPLAY = "Field Set"
export default class Component extends ParentComponent {
  static schema(...extend) {
    return ParentComponent.schema(
      {
        type: ID,
        label: DISPLAY,
        key: ID,
        legend: "",
        components: [],
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
      icon: "th-large",
      weight: 55,
      documentation: Constants.DEFAULT_HELP_LINK,
      schema: Component.schema(),
    }
  }
}
