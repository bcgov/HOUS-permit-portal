import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React from "react"
import { Controller, useFormContext } from "react-hook-form"
import { useMst } from "../../../../../../setup/root"
import { TextFormControl } from "../../../../../shared/form/input-form-control"
import { GridColumnHeader } from "../../shared/grid/column-header"
import { GridData } from "../../shared/grid/data"
import { i18nPrefix } from "../i18n-prefix"
import { FossilFuelsPresenceSelect } from "./fossil-fuels-presence-select"

export const FossilFuels = observer(function BuildingCharacteristicsSummaryFossilFuels() {
  const {
    stepCodeStore: { selectOptions },
  } = useMst()
  const { control } = useFormContext()

  const fieldNamePrefix = "buildingCharacteristicsSummaryAttributes.fossilFuels"

  return (
    <>
      <GridColumnHeader colSpan={3} borderRightWidth={1}>
        {t(`${i18nPrefix}.fossilFuels.label`)}
      </GridColumnHeader>

      <GridData colSpan={3} borderRightWidth={1}>
        <Controller
          control={control}
          name={`${fieldNamePrefix}.presence`}
          render={({ field: { onChange, value } }) => (
            <FossilFuelsPresenceSelect
              onChange={onChange}
              value={value}
              options={selectOptions.buildingCharacteristicsSummary.fossilFuelsPresence}
            />
          )}
        />
      </GridData>
      <GridData colSpan={3} borderTopWidth={0} borderRightWidth={1} borderBottomWidth={1}>
        <TextFormControl fieldName={`${fieldNamePrefix}.details`} />
      </GridData>
    </>
  )
})
