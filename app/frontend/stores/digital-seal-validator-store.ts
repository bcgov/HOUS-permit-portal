import { Instance, types } from "mobx-state-tree"
import { withEnvironment } from "../lib/with-environment"

export const DigitalSealValidatorStoreModel = types
  .model("DigitalSealValidatorStore")
  .props({
    validationResult: types.frozen(),
    error: types.maybeNull(types.string),
  })
  .extend(withEnvironment())
  .volatile((self) => ({
    file: null as File | null,
  }))
  .views((self) => ({
    get uploadEndpoint() {
      return "/api/digital_seal_validator"
    },
  }))
  .actions((self) => ({
    setFile(file: File | null) {
      self.file = file
    },
    setValidationResult(result: any) {
      self.validationResult = result
    },
    setError(error: string | null) {
      self.error = error
    },
    reset() {
      self.file = null
      self.validationResult = null
      self.error = null
    },
  }))

export interface IDigitalSealValidatorStore extends Instance<typeof DigitalSealValidatorStoreModel> {}
