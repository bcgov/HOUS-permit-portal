import { applySnapshot, flow, Instance, toGenerator, types } from "mobx-state-tree"
import { STEP_CODE_PACKAGE_FILE_REQUIREMENT_CODE } from "../constants"
import { withEnvironment } from "../lib/with-environment"
import { withRootStore } from "../lib/with-root-store"
import { IRequirementAttributes, IRequirementBlockParams } from "../types/api-request"
import {
  EAutoComplianceModule,
  EEnergyStepCodeDependencyRequirementCode,
  ERequirementType,
  EVisibility,
} from "../types/enums"
import { RequirementModel } from "./requirement"

export const RequirementBlockModel = types
  .model("RequirementBlockModel", {
    id: types.identifier,
    name: types.string,
    firstNations: types.boolean,
    displayName: types.string,
    requirements: types.array(RequirementModel),
    associations: types.array(types.string),
    description: types.maybeNull(types.string),
    visibility: types.enumeration(Object.values(EVisibility)),
    displayDescription: types.maybeNull(types.string),
    sku: types.string,
    createdAt: types.Date,
    updatedAt: types.Date,
    discardedAt: types.maybeNull(types.Date),
  })
  .extend(withEnvironment())
  .extend(withRootStore())
  .views((self) => ({
    get blocksWithEnergyStepCode() {
      return self.requirements?.some((r) => r.inputType === ERequirementType.energyStepCode)
    },
    get blocksWithStepCodePackageFile() {
      return self.requirements?.some((r) => r.requirementCode === STEP_CODE_PACKAGE_FILE_REQUIREMENT_CODE)
    },
    hasRequirement(id: string) {
      return self.requirements.findIndex((requirement) => requirement.id === id) !== -1
    },
    get hasAnyElective() {
      return self.requirements.some((requirement) => requirement.elective)
    },
    get hasAnyConditional() {
      return self.requirements.some((requirement) => !!requirement.conditional)
    },
    get hasAutomatedCompliance() {
      return self.requirements.some(
        (requirement) =>
          requirement.computedCompliance &&
          Object.values(EAutoComplianceModule).includes(requirement.computedCompliance?.module)
      )
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
            computedCompliance: requirement.inputOptions?.computedCompliance,
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
    get isDiscarded() {
      return self.discardedAt !== null
    },
    get isEarlyAccess() {
      return self.visibility === EVisibility.earlyAccess
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
    destroy: flow(function* () {
      const response = yield self.environment.api.archiveRequirementBlock(self.id)
      if (response.ok) applySnapshot(self, response.data.data)
      return response.ok
    }),
    restore: flow(function* () {
      const response = yield self.environment.api.restoreRequirementBlock(self.id)
      if (response.ok) applySnapshot(self, response.data.data)
      return response.ok
    }),
  }))

export interface IRequirementBlock extends Instance<typeof RequirementBlockModel> {}
