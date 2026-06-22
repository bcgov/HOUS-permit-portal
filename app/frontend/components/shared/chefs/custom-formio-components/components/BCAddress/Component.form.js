import baseEditForm from "formiojs/components/_classes/component/Component.form"
import { interopDefault } from "../../../../../../utils/interop-default"
import AddressEditProvider from "./editForm/Address.edit.provider.js"
export default function (...extend) {
  return interopDefault(baseEditForm)(
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
