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

export const Part9StepCodeChecklistModel = types
  .model("Part9StepCodeChecklistModel", {
    id: types.identifier,
    isLoaded: types.optional(types.boolean, false),
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
    selectedReport: types.maybeNull(types.late(() => types.reference(StepCodeComplianceReportModel))),
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
    get reportsForSelect() {
      return self.complianceReports.map((report) => ({
        value: report.requirementId,
        label: report.requirementId,
      }))
    },
  }))
  .actions((self) => ({
    load: flow(function* () {
      const response = yield self.environment.api.fetchPart9Checklist(self.id)
      if (response.ok) {
        const snapshot = response.data.data

        // 1. Get the ID and remove the object from the main snapshot
        const selectedReportId = snapshot.selectedReport?.requirementId
        delete snapshot.selectedReport

        // 2. Apply the snapshot without the selectedReport. This creates all the complianceReports.
        applySnapshot(self, snapshot)

        // 3. Now that complianceReports exist, find the right one and set the reference.
        if (selectedReportId) {
          // The type inference can be tricky inside a flow, so we cast `self`
          ;(self as IPart9StepCodeChecklist).setSelectedReport(selectedReportId)
        }

        self.isLoaded = true
      }
    }),
    setSelectedReport(requirementId: string) {
      const report = self.complianceReports.find((r) => r.requirementId == requirementId)
      self.selectedReport = report as any
    },
  }))

export interface IPart9StepCodeChecklist extends Instance<typeof Part9StepCodeChecklistModel> {}
