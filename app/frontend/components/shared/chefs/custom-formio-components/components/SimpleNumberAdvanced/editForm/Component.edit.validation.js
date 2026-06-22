import NumberEditValidation from "formiojs/components/number/editForm/Number.edit.validation"
import { interopDefault } from "../../../../../../../utils/interop-default"
import common from "../../Common/Advanced.edit.validation.js"
import { reArrangeComponents } from "../../Common/function.js"

const neededposition = [
  "validate.isUseForCopy",
  "validateOn",
  "validate.required",
  "validate.min",
  "validate.max",
  "errorLabel",
  "validate.customMessage",
  "errors",
  "custom-validation-js",
  "json-validation-json",
]
const numberEditValidationComponents = interopDefault(NumberEditValidation)

const newPosition = reArrangeComponents(neededposition, [...numberEditValidationComponents, ...common])
export default newPosition
