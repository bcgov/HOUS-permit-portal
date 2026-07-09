import baseEditForm from "formiojs/components/textfield/TextField.form"
import { interopDefault } from "../../../../../../utils/interop-default"
import EditDisplay from "./editForm/Component.edit.display.js"
import EditValidation from "./editForm/Component.edit.validation.js"
export default function (...extend) {
  return interopDefault(baseEditForm)(
    [
      {
        key: "display",
        ignore: true,
      },
      {
        key: "validation",
        ignore: true,
      },
      {
        label: "Display",
        key: "customDisplay",
        weight: 5,
        components: EditDisplay,
      },
      {
        label: "Validation",
        key: "customValidation",
        weight: 15,
        components: EditValidation,
      },
    ],
    ...extend
  )
}
