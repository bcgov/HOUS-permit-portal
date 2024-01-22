/* tslint:disable */
import { Components } from "formiojs"
import { Constants } from "../Common/Constants.js"
import editForm from "./Component.form.js"
const ParentComponent = Components.components.day
const ID = "simpleday"
const DISPLAY = "Day"
export default class Component extends ParentComponent {
  static schema(...extend) {
    return ParentComponent.schema(
      {
        type: ID,
        label: DISPLAY,
        key: ID,
        fields: {
          day: {
            type: "number",
            placeholder: "",
            required: false,
          },
          month: {
            type: "select",
            placeholder: "",
            required: false,
          },
          year: {
            type: "number",
            placeholder: "",
            required: false,
          },
        },
        dayFirst: false,
      },
      ...extend
    )
  }
  static editForm = editForm
  static get builderInfo() {
    return {
      title: DISPLAY,
      group: "simple",
      icon: "calendar",
      weight: 21,
      documentation: Constants.DEFAULT_HELP_LINK,
      schema: Component.schema(),
    }
  }
}
