import common from "../../Common/Advanced.edit.display.js"
import { reArrangeComponents } from "../../Common/function.js"
const neededposition = [
  "label",
  "labelPosition",
  "labelWidth",
  "labelMargin",
  "placeholder",
  "description",
  "tooltip",
  "prefix",
  "suffix",
  "widget.type",
  "widget",
  "inputMask",
  "displayMask",
  "inputMaskPlaceholderChar",
  "allowMultipleMasks",
  "customClass",
  "tabindex",
  "autocomplete",
  "hidden",
  "hideLabel",
  "showWordCount",
  "showCharCount",
  "mask",
  "autofocus",
  "spellcheck",
  "disabled",
  "tableView",
  "modalEdit",
]
const newPosition = reArrangeComponents(neededposition, common)
export default newPosition
