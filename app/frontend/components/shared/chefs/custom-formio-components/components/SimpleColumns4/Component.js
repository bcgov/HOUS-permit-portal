/* tslint:disable */
import { Components } from "formiojs"
import { Constants } from "../Common/Constants.js"
import editForm from "./Component.form.js"
const ParentComponent = Components.components.columns
const ID = "simplecols4"
const DISPLAY = "Columns - 4"
export default class Component extends ParentComponent {
  static schema(...extend) {
    return ParentComponent.schema(
      {
        type: ID,
        label: DISPLAY,
        key: ID,
        columns: [
          { components: [], width: 3, offset: 0, push: 0, pull: 0, size: "sm" },
          { components: [], width: 3, offset: 0, push: 0, pull: 0, size: "sm" },
          { components: [], width: 3, offset: 0, push: 0, pull: 0, size: "sm" },
          { components: [], width: 3, offset: 0, push: 0, pull: 0, size: "sm" },
        ],
        clearOnHide: false,
        input: false,
        tableView: false,
        persistent: false,
        autoAdjust: false,
        hideOnChildrenHidden: false,
      },
      ...extend
    )
  }
  static editForm = editForm
  static get builderInfo() {
    return {
      title: DISPLAY,
      group: "simple",
      icon: "columns",
      weight: 52,
      documentation: Constants.DEFAULT_HELP_LINK,
      schema: Component.schema(),
    }
  }
}
