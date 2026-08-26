import { Button, HStack, Text } from "@chakra-ui/react"
import { CheckCircle } from "@phosphor-icons/react"
import { format } from "date-fns"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { datefnsTableDateTimeFormat } from "../../../constants"
import { IStepCode } from "../../../stores/step-code-store"
import { EStepCodeType } from "../../../types/enums"
import { SearchGridItem } from "../../shared/grid/search-grid-item"
import { SearchGridRow } from "../../shared/grid/search-grid-row"
import { StepCodeStageIndicators } from "./step-code-stage-indicators"

export const StepCodesSelectGridRow = observer(
  ({
    stepCode,
    onSelect,
    isAttached = false,
  }: {
    stepCode: IStepCode
    onSelect: (stepCodeId: string) => Promise<void>
    isAttached?: boolean
  }) => {
    const { t } = useTranslation()
    const { type, permitProjectTitle, fullAddress, updatedAt } = stepCode as any

    return (
      <SearchGridRow bg={isAttached ? "theme.blueLight" : undefined} aria-current={isAttached ? "true" : undefined}>
        <SearchGridItem>{t(`stepCode.types.${type as EStepCodeType}`)}</SearchGridItem>
        <SearchGridItem>{permitProjectTitle}</SearchGridItem>
        <SearchGridItem>{fullAddress}</SearchGridItem>
        <SearchGridItem>{updatedAt ? format(updatedAt, datefnsTableDateTimeFormat) : ""}</SearchGridItem>
        <SearchGridItem>
          <StepCodeStageIndicators stageCompletions={stepCode.stageCompletions} />
        </SearchGridItem>
        <SearchGridItem justifyContent="flex-end" px={2}>
          {isAttached ? (
            <HStack color="theme.blueAlt" spacing={1}>
              <CheckCircle size={18} weight="fill" />
              <Text fontSize="sm" fontWeight="bold">
                {t("stepCode.index.attached")}
              </Text>
            </HStack>
          ) : (
            <Button size="md" variant="primary" onClick={() => onSelect(stepCode.id)}>
              {t("ui.select")}
            </Button>
          )}
        </SearchGridItem>
      </SearchGridRow>
    )
  }
)
