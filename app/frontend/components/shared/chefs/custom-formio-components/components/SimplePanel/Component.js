/* tslint:disable */
import { Components } from "formiojs"
import { Constants } from "../Common/Constants.js"
import editForm from "./Component.form.js"
const ParentComponent = Components.components.panel
const ID = "simplepanel"
const DISPLAY = "Panel"
export default class Component extends ParentComponent {
  static schema(...extend) {
    return ParentComponent.schema(
      {
        type: ID,
        label: DISPLAY,
        key: ID,
        title: "Panel",
        theme: "default",
        breadcrumb: "default",
        components: [],
        clearOnHide: false,
        input: false,
        tableView: false,
        persistent: false,
        collapsible: false,
        collapsed: false,
      },
      ...extend
    )
  }
  static editForm = editForm
  static get builderInfo() {
    return {
      title: DISPLAY,
      group: "simple",
      icon: "list-alt",
      weight: 54,
      documentation: Constants.DEFAULT_HELP_LINK,
      schema: Component.schema(),
    }
  }
}
