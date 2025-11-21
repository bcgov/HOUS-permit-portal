import { Button, Grid, GridItem, Text } from "@chakra-ui/react"
import { format } from "date-fns"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { datefnsTableDateTimeFormat } from "../../../constants"
import { IPreCheck } from "../../../models/pre-check"

export const PreChecksSelectGridRow = observer(
  ({ preCheck, onSelect }: { preCheck: IPreCheck; onSelect: (preCheckId: string) => Promise<void> }) => {
    const { t } = useTranslation()
    const { fullAddress, updatedAt } = preCheck

    return (
      <Grid gridColumn="1 / -1" templateColumns="subgrid" display="grid" borderBottom="1px" borderColor="border.light">
        <GridItem display="flex" alignItems="center" px={4} py={2}>
          <Text>{fullAddress}</Text>
        </GridItem>
        <GridItem display="flex" alignItems="center" px={4} py={2}>
          <Text>{updatedAt ? format(updatedAt, datefnsTableDateTimeFormat) : ""}</Text>
        </GridItem>
        <GridItem display="flex" alignItems="center" justifyContent="flex-end" px={2} py={2}>
          <Button size="md" variant="primary" onClick={() => onSelect(preCheck.id)}>
            {t("ui.select")}
          </Button>
        </GridItem>
      </Grid>
    )
  }
)
