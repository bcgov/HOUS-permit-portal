import { Instance, applySnapshot, flow, getSnapshot, types } from "mobx-state-tree"
import * as R from "ramda"
import { withEnvironment } from "../lib/with-environment"
import {
  EStepCodeAirtightnessValue,
  EStepCodeBuildingType,
  EStepCodeChecklistStage,
  EStepCodeChecklistStatus,
  EStepCodeCompliancePath,
  EStepCodeEPCTestingTargetType,
  EStepCodeType,
} from "../types/enums"
import { renameKeys } from "../utils/utility-functions"
import { StepCodeBuildingCharacteristicsSummaryModel } from "./step-code-building-characteristic-summary"
import { StepCodeComplianceReportModel } from "./step-code-compliance-report"

function preProcessor(snapshot) {
  return {
    ...snapshot,
    selectedReportRequirementId: snapshot.selectedReport?.requirementId,
  }
}

export const Part9StepCodeChecklistModel = types.snapshotProcessor(
  types
    .model("Part9StepCodeChecklistModel", {
      id: types.identifier,
      isLoaded: types.maybeNull(types.boolean),
      stage: types.enumeration<EStepCodeChecklistStage[]>(Object.values(EStepCodeChecklistStage)),
      status: types.enumeration<EStepCodeChecklistStatus[]>(Object.values(EStepCodeChecklistStatus)),
      // permit application info
      permitApplicationNumber: types.maybeNull(types.string),
      referenceNumber: types.maybeNull(types.string),
      builder: types.maybeNull(types.string),
      fullAddress: types.maybeNull(types.string),
      jurisdictionName: types.maybeNull(types.string),
      pid: types.maybeNull(types.string),
      // plan, assumed to be based on drawing upload on the permit application
      planAuthor: types.maybeNull(types.string),
      planVersion: types.maybeNull(types.string),
      planDate: types.maybeNull(types.string),
      // user input fields
      buildingType: types.maybeNull(types.enumeration<EStepCodeBuildingType[]>(Object.values(EStepCodeBuildingType))),
      compliancePath: types.maybeNull(
        types.enumeration<EStepCodeCompliancePath[]>(Object.values(EStepCodeCompliancePath))
      ),
      completedBy: types.maybeNull(types.string),
      completedAt: types.maybeNull(types.Date),
      completedByCompany: types.maybeNull(types.string),
      completedByPhone: types.maybeNull(types.string),
      completedByAddress: types.maybeNull(types.string),
      completedByEmail: types.maybeNull(types.string),
      completedByServiceOrganization: types.maybeNull(types.string),
      energyAdvisorId: types.maybeNull(types.string),
      codeco: types.maybeNull(types.boolean),
      pFileNo: types.maybeNull(types.string),
      buildingCharacteristicsSummary: types.maybeNull(StepCodeBuildingCharacteristicsSummaryModel),
      hvacConsumption: types.maybeNull(types.string),
      dhwHeatingConsumption: types.maybeNull(types.string),
      refHvacConsumption: types.maybeNull(types.string),
      refDwhHeatingConsumption: types.maybeNull(types.string),
      epcCalculationAirtightness: types.maybeNull(
        types.enumeration<EStepCodeAirtightnessValue[]>(Object.values(EStepCodeAirtightnessValue))
      ),
      epcCalculationTestingTargetType: types.maybeNull(
        types.enumeration<EStepCodeEPCTestingTargetType[]>(Object.values(EStepCodeEPCTestingTargetType))
      ),
      epcCalculationCompliance: types.maybeNull(types.boolean),
      // calculated / pre-populated fields
      complianceReports: types.array(StepCodeComplianceReportModel),
      selectedReportRequirementId: types.maybeNull(types.string),
    })
    .extend(withEnvironment())
    .views((self) => ({
      get stepCodeType() {
        return EStepCodeType.part9StepCode
      },
      get dwellingUnitsCount() {
        const report =
          self.complianceReports.find((r) => r.requirementId == self.selectedReportRequirementId) ||
          self.complianceReports[0]
        return report?.energy?.dwellingUnitsCount
      },
      get defaultFormValues() {
        const snapshot = getSnapshot(self)
        return renameKeys(
          { buildingCharacteristicsSummary: "buildingCharacteristicsSummaryAttributes" },
          R.pick(
            [
              "referenceNumber",
              "builder",
              "buildingType",
              "compliancePath",
              "completedBy",
              "completedAt",
              "completedByCompany",
              "completedByEmail",
              "completedByAddress",
              "completedByPhone",
              "completedByServiceOrganization",
              "energyAdvisorId",
              "buildingCharacteristicsSummary",
              "hvacConsumption",
              "dhwHeatingConsumption",
              "refHvacConsumption",
              "refDwhHeatingConsumption",
              "epcCalculationAirtightness",
              "epcCalculationTestingTargetType",
              "epcCalculationCompliance",
            ],
            snapshot
          )
        )
      },
      get isComplete() {
        return self.status == EStepCodeChecklistStatus.complete
      },
      get stepRequirementId() {
        const report =
          self.complianceReports.find((r) => r.requirementId == self.selectedReportRequirementId) ||
          self.complianceReports[0]
        return report?.requirementId
      },
    }))
    .views((self) => ({
      get selectedReport() {
        if (!self.complianceReports || self.complianceReports.length === 0) return null as any
        const found = self.complianceReports.find((r) => r.requirementId == self.selectedReportRequirementId)
        return found || self.complianceReports[0]
      },
    }))
    .actions((self) => ({
      load: flow(function* () {
        const response = yield self.environment.api.fetchPart9Checklist(self.id)
        if (response.ok) {
          applySnapshot(self, preProcessor(response.data.data))
          self.isLoaded = true
        }
      }),
      setSelectedReport(requirementId: string) {
        self.selectedReportRequirementId = requirementId
      },
    })),
  { preProcessor }
)

export interface IPart9StepCodeChecklist extends Instance<typeof Part9StepCodeChecklistModel> {}
