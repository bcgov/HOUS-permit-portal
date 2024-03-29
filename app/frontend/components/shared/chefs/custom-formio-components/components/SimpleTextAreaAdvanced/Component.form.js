import baseEditForm from "formiojs/components/textarea/TextArea.form"
import EditValidation from "./editForm/Component.edit.validation.js"
export default function (...extend) {
  return baseEditForm(
    [
      {
        key: "validation",
        ignore: true,
      },
      {
        label: "Validation",
        key: "customValidation",
        weight: 20,
        components: EditValidation,
      },
    ],
    ...extend
  )
}
