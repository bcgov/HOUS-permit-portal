import baseEditForm from "formiojs/components/_classes/component/Component.form"
import SimpleApi from "../Common/Simple.edit.api.js"
import SimpleConditional from "../Common/Simple.edit.conditional.js"
import SimpleValidation from "../Common/Simple.edit.validation.js"
import EditData from "./editForm/Component.edit.data.js"
import EditDisplay from "./editForm/Component.edit.display.js"
export default function (...extend) {
  return baseEditForm(
    [
      EditDisplay,
      {
        key: "data",
        ignore: true,
      },
      {
        key: "api",
        ignore: true,
      },
      {
        key: "layout",
        ignore: true,
      },
      {
        key: "conditional",
        ignore: true,
      },
      {
        key: "validation",
        ignore: true,
      },
      {
        key: "logic",
        ignore: true,
      },
      {
        label: "Data",
        key: "customData",
        weight: 10,
        components: EditData,
      },
      {
        label: "Validation",
        key: "customValidation",
        weight: 20,
        components: SimpleValidation,
      },
      {
        label: "API",
        key: "customAPI",
        weight: 30,
        components: SimpleApi,
      },
      {
        label: "Conditional",
        key: "customConditional",
        weight: 40,
        components: SimpleConditional,
      },
    ],
    ...extend
  )
}
