import baseEditForm from "formiojs/components/_classes/component/Component.form"
import AddressEditProvider from "./editForm/Address.edit.provider.js"
export default function (...extend) {
  return baseEditForm(
    [
      {
        label: "Provider",
        key: "provider",
        weight: 150,
        components: AddressEditProvider,
      },
    ],
    ...extend
  )
}
