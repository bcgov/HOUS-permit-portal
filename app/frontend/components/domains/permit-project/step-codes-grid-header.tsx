import { Flex, GridItemProps, HStack, Text, VStack } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { useMst } from "../../../setup/root"
import { EStepCodeSortFields } from "../../../types/enums"
import { GridHeader } from "../../shared/grid/grid-header"
import { InfoTooltip } from "../../shared/info-tooltip"
import { SortIcon } from "../../shared/sort-icon"
import { stepCodeStageOrder } from "./step-code-stage-indicators"

export const STEP_CODES_GRID_TEMPLATE_COLUMNS = "1fr 1fr 1fr 1fr auto 110px"

export const StepCodesGridHeaders = observer((props: GridItemProps) => {
  const { t } = useTranslation()
  const { stepCodeStore } = useMst()
  const { sort, toggleSort, getSortColumnHeader } = stepCodeStore
  return (
    <>
      {Object.values(EStepCodeSortFields).map((field) => (
        <GridHeader key={field} role={"columnheader"}>
          <Flex
            w={"full"}
            as={"button"}
            justifyContent={"space-between"}
            cursor="pointer"
            onClick={() => toggleSort(field)}
            px={4}
          >
            <Text textAlign="left">{getSortColumnHeader(field)}</Text>
            <SortIcon field={field} currentSort={sort as any} />
          </Flex>
        </GridHeader>
      ))}
      <GridHeader role="columnheader">
        <HStack px={4} gap={1}>
          <Text textAlign="left">{t("stepCode.columns.stages")}</Text>
          <InfoTooltip
            hasArrow
            placement="top"
            maxW="400px"
            whiteSpace="normal"
            label={
              <VStack align="start" spacing={1}>
                {stepCodeStageOrder.map((stage, index) => (
                  <Text key={stage} fontSize="sm">
                    {index + 1}. {t(`stepCodeChecklist.edit.projectInfo.stages.${stage}`)}
                  </Text>
                ))}
                <Text fontSize="sm" pt={1}>
                  {t("stepCode.columns.stagesTooltipLegend")}
                </Text>
              </VStack>
            }
          />
        </HStack>
      </GridHeader>
      <GridHeader role={"columnheader"} />
    </>
  )
})
