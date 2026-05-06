import { HStack, NativeSelect, Text } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"

interface IPerPageSelectProps {
  handleCountPerPageChange(value: number): void
  countPerPage: number
  totalCount: number
}

export const PerPageSelect = observer(({ handleCountPerPageChange, countPerPage, totalCount }: IPerPageSelectProps) => {
  const { t } = useTranslation()

  return (
    <HStack gap={4}>
      <NativeSelect.Root>
        <NativeSelect.Field
          aria-label={"Number of requirement Blocks per page"}
          w={20}
          onValueChange={(e) => handleCountPerPageChange(Number(e.target.value))}
          value={countPerPage}
        >
          <option value="10">10</option>
          <option value="25">25</option>
          <option value="50">50</option>
        </NativeSelect.Field>
        <NativeSelect.Indicator />
      </NativeSelect.Root>
      <Text>
        {totalCount} {t("ui.totalItems")}
      </Text>
    </HStack>
  )
})
