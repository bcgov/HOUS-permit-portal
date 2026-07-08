import baseEditForm from "formiojs/components/url/Url.form"
import { interopDefault } from "../../../../../../utils/interop-default"
import EditValidation from "./editForm/Component.edit.validation.js"
export default function (...extend) {
  return interopDefault(baseEditForm)(
    [
      {
        key: "validation",
        ignore: true,
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
