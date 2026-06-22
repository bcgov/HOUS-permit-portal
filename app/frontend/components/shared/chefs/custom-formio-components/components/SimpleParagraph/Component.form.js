import baseEditForm from "formiojs/components/_classes/component/Component.form"
import { interopDefault } from "../../../../../../utils/interop-default"
import EditDisplay from "./editForm/Component.edit.display.js"
export default function (...extend) {
  return interopDefault(baseEditForm)(
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
        key: "validation",
        ignore: true,
      },
      {
        key: "api",
        ignore: true,
      },
      {
        key: "conditional",
        ignore: true,
      },
      {
        key: "layout",
        ignore: true,
      },
    ],
    ...extend
  )
}
