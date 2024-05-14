import { t } from "i18next"
import React from "react"
import { IStepCodeChecklist } from "../../../../../../models/step-code-checklist"
import { TextFormControl } from "../../../../../shared/form/input-form-control"
import { GridColumnHeader } from "../../shared/grid/column-header"
import { GridData } from "../../shared/grid/data"
import { RequirementsMetTag } from "../../shared/grid/requirements-met-tag"
import { GridRowHeader } from "../../shared/grid/row-header"
import { i18nPrefix } from "../i18n-prefix"

interface IProps {
  checklist: IStepCodeChecklist
}

export const Prescriptive = function Prescriptive({ checklist }: IProps) {
  return (
    <>
      <GridColumnHeader colSpan={4}>{t(`${i18nPrefix}.prescriptive.title`)}</GridColumnHeader>

      <GridRowHeader>{t(`${i18nPrefix}.prescriptive.heating`)}</GridRowHeader>
      <GridData>
        <TextFormControl
          inputProps={{
            isDisabled: true,
            textAlign: "center",
            value: checklist.prescriptiveHeatingRequirement
              ? t(`${i18nPrefix}.prescriptive.${checklist.prescriptiveHeatingRequirement}`)
              : "-",
          }}
        />
      </GridData>
      <GridData>
        <TextFormControl
          inputProps={{
            isDisabled: true,
            textAlign: "center",
            value: checklist.prescriptiveHeating
              ? t(`${i18nPrefix}.prescriptive.${checklist.prescriptiveHeating}`)
              : "-",
          }}
        />
      </GridData>

      <GridData rowSpan={3} alignItems="center" justifyContent="center">
        <RequirementsMetTag success={checklist.prescriptivePassed} />
      </GridData>

      <GridRowHeader>{t(`${i18nPrefix}.prescriptive.hotWater`)}</GridRowHeader>
      <GridData>
        <TextFormControl
          inputProps={{
            isDisabled: true,
            textAlign: "center",
            value: checklist.prescriptiveHotWaterRequirement
              ? t(`${i18nPrefix}.prescriptive.${checklist.prescriptiveHotWaterRequirement}`)
              : "-",
          }}
        />
      </GridData>
      <GridData>
        <TextFormControl
          inputProps={{
            isDisabled: true,
            textAlign: "center",
            value: checklist.prescriptiveHotWater
              ? t(`${i18nPrefix}.prescriptive.${checklist.prescriptiveHotWater}`)
              : "-",
          }}
        />
      </GridData>

      <GridRowHeader>{t(`${i18nPrefix}.prescriptive.other`)}</GridRowHeader>
      <GridData>
        <TextFormControl
          inputProps={{
            isDisabled: true,
            textAlign: "center",
            value: checklist.prescriptiveOtherRequirement
              ? t(`${i18nPrefix}.prescriptive.${checklist.prescriptiveOtherRequirement}`)
              : "-",
          }}
        />
      </GridData>
      <GridData>
        <TextFormControl
          inputProps={{
            isDisabled: true,
            textAlign: "center",
            value: checklist.prescriptiveOther ? t(`${i18nPrefix}.prescriptive.${checklist.prescriptiveOther}`) : "-",
          }}
        />
      </GridData>
    </>
  )
}
