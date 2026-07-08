import { DeepPartial, Instance, applySnapshot, flow, getSnapshot, types } from "mobx-state-tree"
import * as R from "ramda"
import { defaultSectionCompletionStatus, navLinks } from "../components/domains/step-code/part-9/sidebar/nav-sections"
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
import { IPart9NavLink, IPart9SectionCompletionStatus, TPart9NavLinkKey } from "../types/types"
import { renameKeys } from "../utils/utility-functions"
import { markParentStepCodeReportsStale } from "./step-code-base"
import { StepCodeBuildingCharacteristicsSummaryModel } from "./step-code-building-characteristic-summary"
import { StepCodeComplianceReportModel } from "./step-code-compliance-report"

type TPart9StepCodeDataEntry = {
  id?: string
  districtEnergyEf?: number | null
  districtEnergyConsumption?: number | null
  otherGhgEf?: number | null
  otherGhgConsumption?: number | null
  h2kFile?: {
    id: string
    storage?: string | null
    metadata?: {
      size?: number | null
      filename?: string | null
      mimeType?: string | null
    } | null
  } | null
}

function preProcessor(snapshot) {
  const sectionCompletionStatus = R.mergeDeepRight(
    defaultSectionCompletionStatus,
    snapshot.sectionCompletionStatus || {}
  ) as IPart9SectionCompletionStatus
  sectionCompletionStatus.projectInfo = { complete: false, relevant: false }

  return {
    ...snapshot,
    dataEntries: snapshot.dataEntries || [],
    selectedReportRequirementId: snapshot.selectedReport?.requirementId,
    sectionCompletionStatus,
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
      dataEntries: types.frozen<TPart9StepCodeDataEntry[]>(),
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
      sectionCompletionStatus: types.frozen<IPart9SectionCompletionStatus>(),
      complianceReports: types.array(StepCodeComplianceReportModel),
      selectedReportRequirementId: types.maybeNull(types.string),
      updatedAt: types.maybeNull(types.Date),
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
      isComplete(key: TPart9NavLinkKey): boolean {
        return self.sectionCompletionStatus[key]?.complete
      },
      get isAllComplete() {
        if (!self.sectionCompletionStatus) return false
        return Object.values(self.sectionCompletionStatus).every((status) => (status.relevant ? status.complete : true))
      },
      isRelevant(key: TPart9NavLinkKey): boolean {
        return self.sectionCompletionStatus[key]?.relevant
      },
      get isMarkedComplete() {
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
      get currentNavLink(): IPart9NavLink | undefined {
        return navLinks.find((l) => self.isRelevant(l.key) && !self.isComplete(l.key))
      },
    }))
    .actions((self) => ({
      load: flow(function* () {
        const response = yield self.environment.api.fetchPart9Checklist(self.id)
        if (response.ok) {
          // Explicitly include isLoaded in the snapshot to ensure it's preserved
          // This is critical: applySnapshot completely replaces state, so if isLoaded isn't in
          // the snapshot, it gets reset to null. Setting it here ensures it's set during
          // the snapshot application, not after, avoiding timing issues with MobX reactions.
          const snapshotData = { ...preProcessor(response.data.data), isLoaded: true }
          applySnapshot(self, snapshotData)
        }
      }),
      setSelectedReport(requirementId: string) {
        self.selectedReportRequirementId = requirementId
      },
      completeSection: flow(function* (key: TPart9NavLinkKey) {
        let updatedStatus = R.clone(self.sectionCompletionStatus)
        updatedStatus[key] = { complete: true, relevant: true }

        const values: Record<string, any> = { sectionCompletionStatus: updatedStatus }
        const requestOptions = key === "report" ? { reportGenerationRequested: true } : undefined
        if (key === "report") {
          values.status = EStepCodeChecklistStatus.complete
        }

        const response = yield self.environment.api.updatePart9Checklist(self.id, values, requestOptions)
        if (response.ok) {
          const snapshotData = { ...preProcessor(response.data.data), isLoaded: true }
          applySnapshot(self, snapshotData)
          markParentStepCodeReportsStale(self)
          return true
        }
        return false
      }),
      bulkUpdateCompletionStatus: flow(function* (updatedSections: DeepPartial<IPart9SectionCompletionStatus>) {
        let updatedStatus = R.clone(self.sectionCompletionStatus)
        updatedStatus = R.mergeDeepRight(updatedStatus, updatedSections) as IPart9SectionCompletionStatus
        const response = yield self.environment.api.updatePart9Checklist(self.id, {
          sectionCompletionStatus: updatedStatus,
        })
        if (response.ok) {
          const snapshotData = { ...preProcessor(response.data.data), isLoaded: true }
          applySnapshot(self, snapshotData)
          markParentStepCodeReportsStale(self)
          return true
        }
        return false
      }),
      update: flow(function* (values, options?: Record<string, any>) {
        const response = yield self.environment.api.updatePart9Checklist(self.id, values, options)
        if (response.ok) {
          const snapshotData = { ...preProcessor(response.data.data), isLoaded: true }
          applySnapshot(self, snapshotData)
          markParentStepCodeReportsStale(self)
          return true
        }
        return false
      }),
    })),
  { preProcessor }
)

export interface IPart9StepCodeChecklist extends Instance<typeof Part9StepCodeChecklistModel> {}
