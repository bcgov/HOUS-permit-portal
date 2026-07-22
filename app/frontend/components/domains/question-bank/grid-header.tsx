import { Box, Flex, GridItem, HStack, Text, Tooltip } from "@chakra-ui/react"
import { Info } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { ISearch } from "../../../lib/create-search-model"
import { useMst } from "../../../setup/root"
import { EQuestionBankSortFields } from "../../../types/enums"
import { ModelSearchInput } from "../../shared/base/model-search-input"
import { GridHeader } from "../../shared/grid/grid-header"
import { SortIcon } from "../../shared/sort-icon"

export const GridHeaders = observer(function GridHeaders() {
  const { requirementQuestionStore } = useMst()
  const searchModel = requirementQuestionStore
  const { sort, getSortColumnHeader, toggleSort } = searchModel
  const { t } = useTranslation()

  return (
    <Box display={"contents"} role={"rowgroup"} position="fixed">
      <Box display={"contents"} role={"row"}>
        <GridItem
          as={Flex}
          gridColumn={"span 7"}
          p={6}
          bg={"greys.grey10"}
          justifyContent={"space-between"}
          align="center"
        >
          <Text role={"heading"}>{t("questionBank.index.tableHeading")}</Text>
          <ModelSearchInput
            inputGroupProps={{
              position: "sticky",
              right: 6,
            }}
            searchModel={searchModel as ISearch}
          />
        </GridItem>
      </Box>
      <Box display={"contents"} role={"row"}>
        <GridHeader role={"columnheader"}>
          <Flex
            w={"full"}
            as={"button"}
            justifyContent={"space-between"}
            cursor="pointer"
            onClick={() => toggleSort(EQuestionBankSortFields.name)}
            borderRight={"1px solid"}
            borderColor={"border.light"}
            px={4}
          >
            <Text>{getSortColumnHeader(EQuestionBankSortFields.name)}</Text>
            <SortIcon<EQuestionBankSortFields>
              field={EQuestionBankSortFields.name}
              currentSort={sort}
              aria-label={`Sort ${getSortColumnHeader(EQuestionBankSortFields.name)}`}
            />
          </Flex>
        </GridHeader>
        <GridHeader role={"columnheader"}>
          <Text px={4} borderRight={"1px solid"} borderColor={"border.light"}>
            {t("questionBank.fields.description")}
          </Text>
        </GridHeader>
        <GridHeader role={"columnheader"}>
          <Flex
            w={"full"}
            as={"button"}
            justifyContent={"space-between"}
            cursor="pointer"
            onClick={() => toggleSort(EQuestionBankSortFields.associations)}
            borderRight={"1px solid"}
            borderColor={"border.light"}
            px={4}
          >
            <Text>{getSortColumnHeader(EQuestionBankSortFields.associations)}</Text>
            <HStack w={"fit-content"} spacing={3}>
              <SortIcon<EQuestionBankSortFields>
                field={EQuestionBankSortFields.associations}
                currentSort={sort}
                aria-label={`Sort ${getSortColumnHeader(EQuestionBankSortFields.associations)}`}
              />
              <Tooltip label={t("questionBank.associationsInfo")}>
                <Info aria-label={"Info Icon"} />
              </Tooltip>
            </HStack>
          </Flex>
        </GridHeader>
        <GridHeader role={"columnheader"}>
          <Text px={4} borderRight={"1px solid"} borderColor={"border.light"}>
            {t("questionBank.fields.requirementBlocks")}
          </Text>
        </GridHeader>
        <GridHeader role={"columnheader"}>
          <Text px={4} borderRight={"1px solid"} borderColor={"border.light"}>
            {t("questionBank.fields.configurations")}
          </Text>
        </GridHeader>
        <GridHeader role={"columnheader"}>
          <Flex
            w={"full"}
            as={"button"}
            justifyContent={"space-between"}
            cursor="pointer"
            onClick={() => toggleSort(EQuestionBankSortFields.updatedAt)}
            borderRight={"1px solid"}
            borderColor={"border.light"}
            px={4}
          >
            <Text>{getSortColumnHeader(EQuestionBankSortFields.updatedAt)}</Text>
            <SortIcon<EQuestionBankSortFields>
              field={EQuestionBankSortFields.updatedAt}
              currentSort={sort}
              aria-label={`Sort ${getSortColumnHeader(EQuestionBankSortFields.updatedAt)}`}
            />
          </Flex>
        </GridHeader>
        <GridHeader role={"columnheader"} />
      </Box>
    </Box>
  )
})
