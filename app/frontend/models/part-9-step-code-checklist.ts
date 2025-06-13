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
} from "../types/enums"
import { renameKeys } from "../utils/utility-functions"
import { Part9StepCodeType } from "./part-9-step-code"
import { StepCodeBuildingCharacteristicsSummaryModel } from "./step-code-building-characteristic-summary"
import { StepCodeComplianceReportModel } from "./step-code-compliance-report"

function preProcessor(snapshot) {
  return {
    ...snapshot,
    selectedReport: snapshot.selectedReport?.requirementId,
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
      buildingPermitNumber: types.maybeNull(types.string),
      builder: types.maybeNull(types.string),
      address: types.maybeNull(types.string),
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
      selectedReport: types.maybeNull(types.late(() => types.safeReference(StepCodeComplianceReportModel))),
    })
    .extend(withEnvironment())
    .views((self) => ({
      get stepCodeType() {
        return Part9StepCodeType
      },
      get dwellingUnitsCount() {
        return self.selectedReport?.energy?.dwellingUnitsCount
      },
      get defaultFormValues() {
        const snapshot = getSnapshot(self)
        return renameKeys(
          { buildingCharacteristicsSummary: "buildingCharacteristicsSummaryAttributes" },
          R.pick(
            [
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
        return self.selectedReport?.requirementId || self.complianceReports[0].requirementId
      },
    }))
    .actions((self) => ({
      load: flow(function* () {
        const response = yield self.environment.api.fetchPart9Checklist(self.id)
        if (response.ok) {
          const snapshot = response.data.data
          console.log("[Checklist Load] Raw API data (camelCased):", JSON.parse(JSON.stringify(snapshot)))
          const processedSnapshot = preProcessor(snapshot)
          console.log("[Checklist Load] Snapshot for applySnapshot:", JSON.parse(JSON.stringify(processedSnapshot)))

          try {
            applySnapshot(self, processedSnapshot)
            self.isLoaded = true
          } catch (e) {
            console.error("[Checklist Load] Error applying snapshot:", e)
            // Log compliance reports on the model instance at the time of the error
            console.log(
              "[Checklist Load] complianceReports on model during error:",
              JSON.parse(JSON.stringify(self.complianceReports))
            )
            throw e
          }
        }
      }),
      setSelectedReport(requirementId: string) {
        const report = self.complianceReports.find((r) => r.requirementId == requirementId)
        self.selectedReport = report
      },
    })),
  { preProcessor }
)

export interface IPart9StepCodeChecklist extends Instance<typeof Part9StepCodeChecklistModel> {}
