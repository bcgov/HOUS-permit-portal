/* tslint:disable */
import { Components } from "formiojs"
import { Constants } from "../Common/Constants.js"
import editForm from "./Component.form.js"
const ParentComponent = Components.components.textarea
const ID = "simpletextarea"
const DISPLAY = "Multi-line Text"
export default class Component extends ParentComponent {
  static schema(...extend) {
    return ParentComponent.schema(
      {
        type: ID,
        label: DISPLAY,
        key: ID,
        rows: 3,
        wysiwyg: false,
        editor: "",
        spellcheck: true,
        fixedSize: true,
        inputFormat: "plain",
        validate: {
          minWords: "",
          maxWords: "",
        },
      },
      ...extend
    )
  }
  static editForm = editForm
  static get builderInfo() {
    return {
      title: DISPLAY,
      group: "simple",
      icon: "font",
      weight: 2,
      documentation: Constants.DEFAULT_HELP_LINK,
      schema: Component.schema(),
    }
  }
}
