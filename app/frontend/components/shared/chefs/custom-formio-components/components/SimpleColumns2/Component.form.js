import baseEditForm from "formiojs/components/_classes/component/Component.form"
import SimpleApi from "../Common/Simple.edit.api.js"
import SimpleConditional from "../Common/Simple.edit.conditional.js"
import EditDisplay from "./editForm/Component.edit.display.js"
export default function (...extend) {
  return baseEditForm(
    [
      {
        key: "display",
        components: EditDisplay,
      },
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
        key: "modalEdit",
        ignore: true,
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
