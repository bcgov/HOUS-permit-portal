import { Button } from "@chakra-ui/react"
import { format } from "date-fns"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { datefnsTableDateTimeFormat } from "../../../constants"
import { IStepCode } from "../../../stores/step-code-store"
import { EStepCodeType } from "../../../types/enums"
import { SearchGridItem } from "../../shared/grid/search-grid-item"
import { SearchGridRow } from "../../shared/grid/search-grid-row"

export const StepCodesSelectGridRow = observer(
  ({ stepCode, onSelect }: { stepCode: IStepCode; onSelect: (stepCodeId: string) => Promise<void> }) => {
    const { t } = useTranslation()
    const { type, permitProjectTitle, fullAddress, updatedAt } = stepCode as any

    return (
      <SearchGridRow>
        <SearchGridItem>{t(`stepCode.types.${type as EStepCodeType}`)}</SearchGridItem>
        <SearchGridItem>{permitProjectTitle}</SearchGridItem>
        <SearchGridItem>{fullAddress}</SearchGridItem>
        <SearchGridItem>{updatedAt ? format(updatedAt, datefnsTableDateTimeFormat) : ""}</SearchGridItem>
        <SearchGridItem justifyContent="flex-end" px={2}>
          <Button size="md" variant="primary" onClick={() => onSelect(stepCode.id)}>
            {t("ui.select")}
          </Button>
        </SearchGridItem>
      </SearchGridRow>
    )
  }
)
