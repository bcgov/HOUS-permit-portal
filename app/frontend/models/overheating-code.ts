import { flow, Instance, types } from "mobx-state-tree"
import { withEnvironment } from "../lib/with-environment"
import { EOverheatingCodeStatus } from "../types/enums"
import { downloadFromApi } from "../utils/utility-functions"
import { JurisdictionModel } from "./jurisdiction"

export const OverheatingCodeModel = types
  .model("OverheatingCode", {
    id: types.identifier,
    status: types.enumeration(Object.values(EOverheatingCodeStatus)),
    issuedTo: types.maybeNull(types.string),
    projectNumber: types.maybeNull(types.string),
    fullAddress: types.maybeNull(types.string),
    pid: types.maybeNull(types.string),
    jurisdiction: types.maybeNull(types.reference(types.late(() => JurisdictionModel))),
    buildingModel: types.maybeNull(types.string),
    siteName: types.maybeNull(types.string),
    lot: types.maybeNull(types.string),
    postalCode: types.maybeNull(types.string),
    designatedRooms: types.maybeNull(types.string),
    coolingZoneUnits: types.maybeNull(types.string),
    minimumCoolingCapacity: types.maybeNull(types.number),
    designOutdoorTemp: types.maybeNull(types.number),
    designIndoorTemp: types.maybeNull(types.number),
    designAdjacentTemp: types.maybeNull(types.number),
    coolingZoneArea: types.maybeNull(types.number),
    weatherLocation: types.maybeNull(types.string),
    ventilationRate: types.maybeNull(types.number),
    hrvErv: types.optional(types.boolean, false),
    atrePercentage: types.maybeNull(types.number),
    componentsFacingOutside: types.optional(types.array(types.string), []),
    componentsFacingAdjacent: types.optional(types.array(types.string), []),
    documentNotes: types.optional(types.array(types.string), []),
    // Calculations Performed By
    performerName: types.maybeNull(types.string),
    performerCompany: types.maybeNull(types.string),
    performerAddress: types.maybeNull(types.string),
    performerCityProvince: types.maybeNull(types.string),
    performerPostalCode: types.maybeNull(types.string),
    performerPhone: types.maybeNull(types.string),
    performerFax: types.maybeNull(types.string),
    performerEmail: types.maybeNull(types.string),
    accreditationRef1: types.maybeNull(types.string),
    accreditationRef2: types.maybeNull(types.string),
    issuedFor1: types.maybeNull(types.string),
    issuedFor2: types.maybeNull(types.string),
    createdAt: types.maybeNull(types.Date),
    updatedAt: types.maybeNull(types.Date),
  })
  .extend(withEnvironment())
  .views((self) => ({
    get isSubmitted() {
      return self.status === EOverheatingCodeStatus.submitted
    },
    get isIntroductionComplete() {
      return !!self.issuedTo && !!self.projectNumber
    },
    get isBuildingLocationComplete() {
      return !!self.fullAddress
    },
    get isCoolingZoneComplianceComplete() {
      return self.minimumCoolingCapacity != null && self.minimumCoolingCapacity > 0
    },
    get isDesignConditionsComplete() {
      return (
        self.designOutdoorTemp != null &&
        self.designIndoorTemp != null &&
        self.coolingZoneArea != null &&
        self.coolingZoneArea > 0 &&
        !!self.weatherLocation
      )
    },
    get isBuildingComponentsComplete() {
      return self.componentsFacingOutside.length > 0
    },
    get isAttachedDocumentsComplete() {
      return self.documentNotes.length > 0
    },
    get isCalculationsPerformedByComplete() {
      return !!self.performerName && !!self.performerEmail
    },
    get pdfFilename() {
      const project = self.projectNumber || self.id.slice(0, 8)
      return `BC-SZCG-Report-${project}.pdf`
    },
  }))
  .actions((self) => ({
    downloadPdf: flow(function* () {
      yield downloadFromApi(`/api/overheating_codes/${self.id}/generate_pdf`, self.pdfFilename)
    }),
  }))

export interface IOverheatingCode extends Instance<typeof OverheatingCodeModel> {}
