import { Flex, GridItemProps, Text } from "@chakra-ui/react"
import { Warning } from "@phosphor-icons/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { SearchGridItem } from "./grid/search-grid-item"

export const OutdatedFormWarning = (props: GridItemProps) => {
  const { t } = useTranslation()

  return (
    <SearchGridItem bg="semantic.warning" p={1} zIndex={10} {...props}>
      <Flex alignItems="center" gap={1}>
        <Warning size={14} />
        <Text fontSize="xs">
          <Text as="span" fontWeight="bold">
            {t("permitProject.formUpdateWarningTitle")}
          </Text>
          : {t("permitProject.formUpdateWarningDescription")}
        </Text>
      </Flex>
    </SearchGridItem>
  )
}
