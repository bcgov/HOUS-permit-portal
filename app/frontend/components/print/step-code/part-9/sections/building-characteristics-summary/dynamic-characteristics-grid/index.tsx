import React from "react"
import { IPart9StepCodeChecklist } from "../../../../../../../models/part-9-step-code-checklist"
import { i18nPrefix } from "../../../../../../domains/step-code/part-9/checklist/building-characteristics-summary/i18n-prefix"
import { reportTranslation as t } from "../../../../../components/report-translation"
import { ReportGrid } from "../../../../../components/step-code-primitives"
import { Airtightness } from "./airtightness"
import { Doors } from "./doors"
import { FossilFuels } from "./fossil-fuels"
import { HotWater } from "./hot-water"
import { Other } from "./other"
import { SpaceHeatingCooling } from "./space-heating-cooling"
import { Ventilation } from "./ventilation"
import { WindowsGlazedDoors } from "./windows-glazed-doors"

interface IProps {
  checklist: IPart9StepCodeChecklist
}

export function DynamicCharacteristicsGrid({ checklist }: IProps) {
  return (
    <ReportGrid headers={[t(`${i18nPrefix}.details`), t(`${i18nPrefix}.performanceValues`)]} spans={[2, 2]}>
      <WindowsGlazedDoors checklist={checklist} />
      <Doors checklist={checklist} />
      <Airtightness checklist={checklist} />
      <SpaceHeatingCooling checklist={checklist} />
      <HotWater checklist={checklist} />
      <Ventilation checklist={checklist} />
      <Other checklist={checklist} />
      <FossilFuels checklist={checklist} />
    </ReportGrid>
  )
}
