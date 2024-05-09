import { applySnapshot, flow, Instance, toGenerator, types } from "mobx-state-tree"
import { withEnvironment } from "../lib/with-environment"
import { withRootStore } from "../lib/with-root-store"
import { IRequirementAttributes, IRequirementBlockParams } from "../types/api-request"
import { EEnergyStepCodeDependencyRequirementCode } from "../types/enums"
import { RequirementModel } from "./requirement"

export const RequirementBlockModel = types
  .model("RequirementBlockModel", {
    id: types.identifier,
    name: types.string,
    displayName: types.string,
    requirements: types.array(RequirementModel),
    associations: types.array(types.string),
    description: types.maybeNull(types.string),
    displayDescription: types.maybeNull(types.string),
    sku: types.string,
    createdAt: types.Date,
    updatedAt: types.Date,
  })
  .extend(withEnvironment())
  .extend(withRootStore())
  .views((self) => ({
    hasRequirement(id: string) {
      return self.requirements.findIndex((requirement) => requirement.id === id) !== -1
    },
    get hasAnyElective() {
      return self.requirements.some((requirement) => requirement.elective)
    },
    get hasAnyConditional() {
      return self.requirements.some((requirement) => !!requirement.conditional)
    },
    get hasAnyDataValidation() {
      return self.requirements.some((requirement) => !!requirement.dataValidation)
    },
    get requirementFormDefaults(): IRequirementAttributes[] {
      return self.requirements.map((requirement) => {
        if (!requirement.conditional) return requirement as unknown as IRequirementAttributes

        const { conditional } = requirement

        const possibleThens = ["show", "hide", "require"]
        const when = conditional.when
        const operand = conditional.eq
        const then = possibleThens.find((t) => Object.keys(conditional).includes(t))
        const isEnergyStepCodeDependency = Object.values(EEnergyStepCodeDependencyRequirementCode).includes(
          requirement.requirementCode as EEnergyStepCodeDependencyRequirementCode
        )

        // energy step code dependency conditionals is not possible to edit from the front-end and has default values
        // which follows a slightly different structure so we make sure not to remove them or alter them
        return {
          ...requirement,
          inputOptions: {
            ...requirement.inputOptions,
            conditional: isEnergyStepCodeDependency
              ? conditional
              : {
                  when,
                  operand,
                  then,
                },
            energyStepCode: requirement.inputOptions?.energyStepCode,
          },
        }
      })
    },
    getRequirementOptions() {
      return self.requirements.map((requirement) => ({ label: requirement.label, value: requirement }))
    },
    getRequirementByRequirementCode(requirementCode: string) {
      return self.requirements.find((requirement) => requirement.requirementCode === requirementCode)
    },
  }))
  .actions((self) => ({
    update: flow(function* (requirementParams: IRequirementBlockParams) {
      const response = yield* toGenerator(self.environment.api.updateRequirementBlock(self.id, requirementParams))

      if (response.ok) {
        applySnapshot(self, response.data.data)
      }

      return response.ok
    }),
  }))

export interface IRequirementBlock extends Instance<typeof RequirementBlockModel> {}
