import { Button, Grid, GridItem, Text } from "@chakra-ui/react"
import { format } from "date-fns"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { datefnsTableDateTimeFormat } from "../../../constants"
import { IStepCode } from "../../../stores/step-code-store"
import { EStepCodeType } from "../../../types/enums"

export const StepCodesSelectGridRow = observer(
  ({ stepCode, onSelect }: { stepCode: IStepCode; onSelect: (stepCodeId: string) => Promise<void> }) => {
    const { t } = useTranslation()
    const { type, permitProjectTitle, fullAddress, updatedAt } = stepCode as any

    return (
      <Grid gridColumn="1 / -1" templateColumns="subgrid" display="grid" borderBottom="1px" borderColor="border.light">
        <GridItem display="flex" alignItems="center" px={4} py={2}>
          <Text>{t(`stepCode.types.${type as EStepCodeType}`)}</Text>
        </GridItem>
        <GridItem display="flex" alignItems="center" px={4} py={2}>
          <Text>{permitProjectTitle}</Text>
        </GridItem>
        <GridItem display="flex" alignItems="center" px={4} py={2}>
          <Text>{fullAddress}</Text>
        </GridItem>
        <GridItem display="flex" alignItems="center" px={4} py={2}>
          <Text>{updatedAt ? format(updatedAt, datefnsTableDateTimeFormat) : ""}</Text>
        </GridItem>
        <GridItem display="flex" alignItems="center" justifyContent="flex-end" px={2} py={2}>
          <Button size="md" variant="primary" onClick={() => onSelect(stepCode.id)}>
            {t("ui.select")}
          </Button>
        </GridItem>
      </Grid>
    )
  }
)
