import baseEditForm from "formiojs/components/_classes/component/Component.form"
import SimpleApi from "../Common/Simple.edit.api.js"
import SimpleConditional from "../Common/Simple.edit.conditional.js"
import EditData from "./editForm/Component.edit.data.js"
import EditDay from "./editForm/Component.edit.day.js"
import EditDisplay from "./editForm/Component.edit.display.js"
import EditMonth from "./editForm/Component.edit.month.js"
import EditValidation from "./editForm/Component.edit.validation.js"
import EditYear from "./editForm/Component.edit.year.js"
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
        label: "Data",
        key: "customData",
        weight: 10,
        components: EditData,
      },
      {
        label: "Validation",
        key: "customValidation",
        weight: 20,
        components: EditValidation,
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
      {
        key: "day",
        label: "Day",
        weight: 3,
        components: EditDay,
      },
      {
        key: "month",
        label: "Month",
        weight: 3,
        components: EditMonth,
      },
      {
        key: "year",
        label: "Year",
        weight: 3,
        components: EditYear,
      },
    ],
    ...extend
  )
}
