import { t } from "i18next"
import React from "react"
import { IStepCodeZeroCarbonComplianceReport } from "../../../../../../models/step-code-zero-carbon-compliance-report"
import { TextFormControl } from "../../../../../shared/form/input-form-control"
import { GridColumnHeader } from "../../shared/grid/column-header"
import { GridData } from "../../shared/grid/data"
import { RequirementsMetTag } from "../../shared/grid/requirements-met-tag"
import { GridRowHeader } from "../../shared/grid/row-header"
import { i18nPrefix } from "../i18n-prefix"

interface IProps {
  compliance: IStepCodeZeroCarbonComplianceReport
}

export const Prescriptive = function Prescriptive({ compliance }: IProps) {
  return (
    <>
      <GridColumnHeader colSpan={4}>{t(`${i18nPrefix}.prescriptive.title`)}</GridColumnHeader>

      <GridRowHeader>{t(`${i18nPrefix}.prescriptive.heating`)}</GridRowHeader>
      <GridData>
        <TextFormControl
          inputProps={{
            isDisabled: true,
            textAlign: "center",
            value: compliance.prescriptiveHeatingRequirement
              ? t(`${i18nPrefix}.prescriptive.${compliance.prescriptiveHeatingRequirement}`)
              : "-",
          }}
        />
      </GridData>
      <GridData>
        <TextFormControl
          inputProps={{
            isDisabled: true,
            textAlign: "center",
            value: compliance.prescriptiveHeating
              ? t(`${i18nPrefix}.prescriptive.${compliance.prescriptiveHeating}`)
              : "-",
          }}
        />
      </GridData>

      <GridData rowSpan={3} alignItems="center" justifyContent="center">
        <RequirementsMetTag success={compliance.prescriptivePassed} />
      </GridData>

      <GridRowHeader>{t(`${i18nPrefix}.prescriptive.hotWater`)}</GridRowHeader>
      <GridData>
        <TextFormControl
          inputProps={{
            isDisabled: true,
            textAlign: "center",
            value: compliance.prescriptiveHotWaterRequirement
              ? t(`${i18nPrefix}.prescriptive.${compliance.prescriptiveHotWaterRequirement}`)
              : "-",
          }}
        />
      </GridData>
      <GridData>
        <TextFormControl
          inputProps={{
            isDisabled: true,
            textAlign: "center",
            value: compliance.prescriptiveHotWater
              ? t(`${i18nPrefix}.prescriptive.${compliance.prescriptiveHotWater}`)
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
            value: compliance.prescriptiveOtherRequirement
              ? t(`${i18nPrefix}.prescriptive.${compliance.prescriptiveOtherRequirement}`)
              : "-",
          }}
        />
      </GridData>
      <GridData>
        <TextFormControl
          inputProps={{
            isDisabled: true,
            textAlign: "center",
            value: compliance.prescriptiveOther ? t(`${i18nPrefix}.prescriptive.${compliance.prescriptiveOther}`) : "-",
          }}
        />
      </GridData>
    </>
  )
}
