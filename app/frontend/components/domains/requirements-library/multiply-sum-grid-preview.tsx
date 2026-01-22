import { Box, Grid } from "@chakra-ui/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { EditableInputWithControls } from "../../shared/editable-input-with-controls"

export type TMultiplySumGridHeaders = {
  firstColumn?: string
  a?: string
  quantity?: string
  ab?: string
}

type THeaderControl = { value?: string; onChange?: (next: string) => void }

export function MultiplySumGridPreview({
  headers,
  controls,
}: {
  headers?: TMultiplySumGridHeaders
  controls?: {
    firstColumn?: THeaderControl
    a?: THeaderControl
    quantity?: THeaderControl
    ab?: THeaderControl
  }
}) {
  const { t } = useTranslation()
  const first = headers?.firstColumn || t("requirementsLibrary.multiplySumGrid.addHeaderPlaceholder")
  const aBase = headers?.a || t("requirementsLibrary.multiplySumGrid.addHeaderPlaceholder")
  const a = `${aBase} (A)`
  const quantityBase = headers?.quantity || t("requirementsLibrary.multiplySumGrid.quantityB")
  const quantity = `${quantityBase} (B)`
  const abBase = headers?.ab || t("requirementsLibrary.multiplySumGrid.ab")
  const ab = `${abBase} (A × B)`
  return (
    <Box bg={"white"} border={"1px solid"} borderColor={"border.light"} p={2}>
      <Box fontWeight={600} mb={1.5}>
        {t("requirementsLibrary.multiplySumGrid.title")}
      </Box>
      <Grid templateColumns={"2fr 2fr 2fr 1fr"} gap={2}>
        <Box>
          {controls?.firstColumn ? (
            <EditableInputWithControls
              value={(controls.firstColumn.value ?? first) as any}
              onChange={(val: string) => controls.firstColumn?.onChange?.(val)}
              onSubmit={(val: string) => controls.firstColumn?.onChange?.(val)}
              initialHint={t("ui.clickToEdit")}
              compact
            />
          ) : (
            first
          )}
        </Box>
        <Box>
          {controls?.a ? (
            <EditableInputWithControls
              value={(controls.a.value ?? aBase) as any}
              onChange={(val: string) => controls.a?.onChange?.(val)}
              onSubmit={(val: string) => controls.a?.onChange?.(val)}
              initialHint={t("ui.clickToEdit")}
              compact
            />
          ) : (
            a
          )}
        </Box>
        <Box>
          {controls?.quantity ? (
            <EditableInputWithControls
              value={(controls.quantity.value ?? quantityBase) as any}
              onChange={(val: string) => controls.quantity?.onChange?.(val)}
              onSubmit={(val: string) => controls.quantity?.onChange?.(val)}
              initialHint={t("ui.clickToEdit")}
              compact
            />
          ) : (
            quantity
          )}
        </Box>
        <Box>
          {controls?.ab ? (
            <EditableInputWithControls
              value={(controls.ab.value ?? abBase) as any}
              onChange={(val: string) => controls.ab?.onChange?.(val)}
              onSubmit={(val: string) => controls.ab?.onChange?.(val)}
              initialHint={t("ui.clickToEdit")}
              compact
            />
          ) : (
            ab
          )}
        </Box>
        <Box>...</Box>
        <Box>...</Box>
        <Box>...</Box>
        <Box>...</Box>
      </Grid>
    </Box>
  )
}
