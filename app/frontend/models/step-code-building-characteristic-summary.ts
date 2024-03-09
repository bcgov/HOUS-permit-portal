import { Instance, types } from "mobx-state-tree"
import { withEnvironment } from "../lib/with-environment"
import { withMerge } from "../lib/with-merge"
import { withRootStore } from "../lib/with-root-store"

export const StepCodeBuildingCharacteristicsSummaryModel = types
  .model("StepCodeBuildingCharacteristicSummaryModel", {
    id: types.identifier,
    roofCeilingsLines: types.array(types.frozen()),
    aboveGradeWallsLines: types.array(types.frozen()),
    framingsLines: types.array(types.frozen()),
    unheatedFloorsLines: types.array(types.frozen()),
    belowGradeWallsLines: types.array(types.frozen()),
    slabsLines: types.array(types.frozen()),
    doorsLines: types.array(types.frozen()),
    spaceHeatingCoolingLines: types.array(types.frozen()),
    hotWaterLines: types.array(types.frozen()),
    ventilationLines: types.array(types.frozen()),
    otherLines: types.array(types.frozen()),
    airtightness: types.frozen(),
    windowsGlazedDoors: types.frozen(),
    fossilFuels: types.frozen(),
  })
  .extend(withEnvironment())
  .extend(withRootStore())
  .extend(withMerge())
  .views((self) => ({}))

  .actions((self) => ({}))

export interface IStepCodeBuildingCharacteristicsSummary
  extends Instance<typeof StepCodeBuildingCharacteristicsSummaryModel> {}
