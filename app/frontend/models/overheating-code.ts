import { Instance, types } from "mobx-state-tree"
import { withEnvironment } from "../lib/with-environment"
import {
  EOverheatingCodeAirTightnessCategory,
  EOverheatingCodeAttachment,
  EOverheatingCodeCalculationUnits,
  EOverheatingCodeFrontFacing,
  EOverheatingCodeInternalShading,
  EOverheatingCodeSoilConductivity,
  EOverheatingCodeStatus,
  EOverheatingCodeSubmittalType,
  EOverheatingCodeUnits,
  EOverheatingCodeWaterTableDepth,
  EOverheatingCodeWindExposure,
  EOverheatingCodeWindSheltering,
} from "../types/enums"
import { JurisdictionModel } from "./jurisdiction"

const RoomResultModel = types.model("RoomResult", {
  roomName: types.optional(types.string, ""),
  heating: types.maybeNull(types.number),
  cooling: types.maybeNull(types.number),
})

export interface IRoomResult extends Instance<typeof RoomResultModel> {}

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
    submittalType: types.maybeNull(types.enumeration(Object.values(EOverheatingCodeSubmittalType))),
    units: types.maybeNull(types.enumeration(Object.values(EOverheatingCodeUnits))),
    dimensionalInfoBasedOn: types.maybeNull(types.string),
    attachment: types.maybeNull(types.enumeration(Object.values(EOverheatingCodeAttachment))),
    numberOfStories: types.maybeNull(types.number),
    hasBasement: types.maybeNull(types.boolean),
    weatherLocation: types.maybeNull(types.string),
    ventilated: types.maybeNull(types.boolean),
    hrvErv: types.maybeNull(types.boolean),
    asePercentage: types.maybeNull(types.number),
    atrePercentage: types.maybeNull(types.number),
    frontFacing: types.maybeNull(types.enumeration(Object.values(EOverheatingCodeFrontFacing))),
    frontFacingAssumed: types.maybeNull(types.boolean),
    airTightnessCategory: types.maybeNull(types.enumeration(Object.values(EOverheatingCodeAirTightnessCategory))),
    airTightnessAch50: types.maybeNull(types.number),
    airTightnessEla10: types.maybeNull(types.number),
    airTightnessAssumed: types.maybeNull(types.boolean),
    windExposure: types.maybeNull(types.enumeration(Object.values(EOverheatingCodeWindExposure))),
    windSheltering: types.maybeNull(types.enumeration(Object.values(EOverheatingCodeWindSheltering))),
    internalShading: types.maybeNull(types.enumeration(Object.values(EOverheatingCodeInternalShading))),
    internalShadingAssumed: types.maybeNull(types.boolean),
    occupants: types.maybeNull(types.number),
    occupantsAssumed: types.maybeNull(types.boolean),
    calculationUnits: types.maybeNull(types.enumeration(Object.values(EOverheatingCodeCalculationUnits))),
    heatingOutdoorTemp: types.maybeNull(types.number),
    heatingIndoorTemp: types.maybeNull(types.number),
    meanSoilTemp: types.maybeNull(types.number),
    soilConductivity: types.maybeNull(types.enumeration(Object.values(EOverheatingCodeSoilConductivity))),
    waterTableDepth: types.maybeNull(types.enumeration(Object.values(EOverheatingCodeWaterTableDepth))),
    slabFluidTemp: types.maybeNull(types.number),
    coolingOutdoorTemp: types.maybeNull(types.number),
    coolingIndoorTemp: types.maybeNull(types.number),
    dailyTempRange: types.maybeNull(types.number),
    latitude: types.maybeNull(types.number),
    aboveGradeWalls: types.optional(types.array(types.string), []),
    belowGradeWalls: types.optional(types.array(types.string), []),
    floorsOnSoil: types.optional(types.array(types.string), []),
    ceilings: types.optional(types.array(types.string), []),
    exposedFloors: types.optional(types.array(types.string), []),
    doors: types.optional(types.array(types.string), []),
    windows: types.optional(types.array(types.string), []),
    skylights: types.optional(types.array(types.string), []),
    minimumHeatingCapacity: types.maybeNull(types.number),
    nominalCoolingCapacity: types.maybeNull(types.number),
    minimumCoolingCapacity: types.maybeNull(types.number),
    maximumCoolingCapacity: types.maybeNull(types.number),
    roomResults: types.optional(types.array(RoomResultModel), []),
    ventilationLoss: types.maybeNull(types.number),
    latentGain: types.maybeNull(types.number),
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
    get isComplianceComplete() {
      return !!self.submittalType && !!self.units
    },
    get isCalculationsBasedOnComplete() {
      return !!self.dimensionalInfoBasedOn && !!self.weatherLocation
    },
    get isHeatingDesignConditionsComplete() {
      return self.heatingOutdoorTemp != null && self.heatingIndoorTemp != null
    },
    get isCoolingDesignConditionsComplete() {
      return self.coolingOutdoorTemp != null && self.coolingIndoorTemp != null
    },
    get isBuildingEnvelopeComplete() {
      return (
        self.aboveGradeWalls.length > 0 ||
        self.belowGradeWalls.length > 0 ||
        self.floorsOnSoil.length > 0 ||
        self.ceilings.length > 0 ||
        self.exposedFloors.length > 0 ||
        self.doors.length > 0 ||
        self.windows.length > 0 ||
        self.skylights.length > 0
      )
    },
    get isRoomByRoomComplete() {
      return self.roomResults.length > 0 && self.roomResults.every((r) => r.roomName.trim() !== "")
    },
    get isHeatingComplete() {
      return self.minimumHeatingCapacity != null && self.minimumHeatingCapacity > 0
    },
    get isCoolingComplete() {
      return self.nominalCoolingCapacity != null && self.nominalCoolingCapacity > 0
    },
  }))

export interface IOverheatingCode extends Instance<typeof OverheatingCodeModel> {}
