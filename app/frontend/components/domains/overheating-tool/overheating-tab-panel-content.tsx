import {
  Box,
  Button,
  Container,
  Divider,
  Flex,
  FormControl,
  GridItem,
  Heading,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Radio,
  RadioGroup,
  Stack,
  Text,
  useDisclosure,
  VStack,
} from "@chakra-ui/react"
import { CaretRight } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import * as R from "ramda"
import React, { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useMst } from "../../../setup/root"
import { EFlashMessageStatus } from "../../../types/enums"
import { CustomMessageBox } from "../../shared/base/custom-message-box"
import { Paginator } from "../../shared/base/inputs/paginator"
import { PerPageSelect } from "../../shared/base/inputs/per-page-select"
import { ModelSearchInput } from "../../shared/base/model-search-input"
import { SharedSpinner } from "../../shared/base/shared-spinner"
import { SearchGrid } from "../../shared/grid/search-grid"
import { RouterLinkButton } from "../../shared/navigation/router-link-button"
import { GridHeaders, OVERHEATING_GRID_TEMPLATE_COLUMNS } from "./grid-header"
import { OverheatingToolGridRow } from "./overheating-tool-grid-row"

export const OverheatingTabPanelContent = observer(() => {
  const { t } = useTranslation() as any
  const { overheatingToolStore } = useMst()
  const [statusChoice, setStatusChoice] = useState<string>(overheatingToolStore.statusFilter)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const {
    isLoading,
    tableOverheatingTools,
    search,
    countPerPage,
    totalCount,
    currentPage,
    totalPages,
    handleCountPerPageChange,
    handlePageChange,
  } = overheatingToolStore

  useEffect(() => {
    // Initial load: sync with URL or use defaults
    overheatingToolStore.syncWithUrl()
    search({ page: 1, countPerPage: 10 })
  }, [])

  const archiveTool = async (id: string) => {
    await overheatingToolStore.archiveOverheatingTool(id)
  }

  return (
    <Flex direction="column" flex={1} bg="greys.white" pb={24} overflowY="auto" h={"full"}>
      <Container maxW="container.xl" py={8} h={"full"}>
        <VStack spacing={3} align="stretch">
          <Flex justify="space-between" align="center">
            <Heading>{t("singleZoneCoolingHeatingTool.indexTitle")}</Heading>
          </Flex>
          <Box w="full" bg="theme.blueLight" p={6} borderRadius="md">
            <Box maxW="xl">
              <Heading as="h3" mb={6}>
                {t("singleZoneCoolingHeatingTool.createReportTitle")}
              </Heading>
              <Text mb={3}>
                {t("singleZoneCoolingHeatingTool.createReportDescriptionPrefix")}{" "}
                {t("singleZoneCoolingHeatingTool.createReportDescriptionLink")}
              </Text>
              <RouterLinkButton rightIcon={<CaretRight />} to="/overheating-tool/start">
                {t("stepCode.createButton")}
              </RouterLinkButton>
              <Divider borderColor="greys.grey03" my={4} />
            </Box>
          </Box>
          <Flex direction="column" gap={4} w="full">
            <Heading as="h3" mb={5} mt={4}>
              {t("singleZoneCoolingHeatingTool.pickUpWhereYouLeftOff")}
            </Heading>
            <Flex gap={4} w="full" align="center">
              <FormControl maxW="240px">
                <Popover isOpen={isOpen} onClose={onClose} placement="bottom-start">
                  <PopoverTrigger>
                    <Button variant="outline" onClick={onOpen} w="full">
                      {statusChoice === "archived"
                        ? (t as any)("singleZoneCoolingHeatingTool.archived") || "Archived"
                        : (t as any)("singleZoneCoolingHeatingTool.active") || "Active"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent w="240px">
                    <PopoverArrow />
                    <PopoverBody p={0}>
                      <Box p={4}>
                        <RadioGroup value={statusChoice} onChange={(v) => setStatusChoice(v as string)}>
                          <Stack direction="column" spacing={6}>
                            <Radio value="unarchived">
                              {(t as any)("singleZoneCoolingHeatingTool.active") || "Active"}
                            </Radio>
                            <Radio value="archived">
                              {(t as any)("singleZoneCoolingHeatingTool.archived") || "Archived"}
                            </Radio>
                          </Stack>
                        </RadioGroup>
                        <Button
                          mt={6}
                          w="full"
                          variant="primary"
                          onClick={() => {
                            overheatingToolStore.setStatusFilter(statusChoice as any)
                            search({ page: 1 })
                            onClose()
                          }}
                        >
                          {(t as any)("ui.apply") || "Apply"}
                        </Button>
                      </Box>
                    </PopoverBody>
                  </PopoverContent>
                </Popover>
              </FormControl>
              <FormControl w="full">
                <ModelSearchInput
                  searchModel={overheatingToolStore as any}
                  inputProps={{ placeholder: t("ui.search"), width: "full" }}
                  inputGroupProps={{ width: "full" }}
                />
              </FormControl>
            </Flex>
          </Flex>
          <SearchGrid templateColumns={OVERHEATING_GRID_TEMPLATE_COLUMNS} gridRowClassName="project-grid-row">
            <GridHeaders includeActionColumn />

            {isLoading ? (
              <GridItem gridColumn="1 / -1">
                <Flex justify="center" align="center" minH="200px">
                  <SharedSpinner />
                </Flex>
              </GridItem>
            ) : R.isEmpty(tableOverheatingTools) ? (
              <GridItem gridColumn="1 / -1">
                <CustomMessageBox
                  m={4}
                  status={EFlashMessageStatus.info}
                  description={t("singleZoneCoolingHeatingTool.noneFoundExplanation")}
                />
              </GridItem>
            ) : (
              tableOverheatingTools
                .filter((tool) => {
                  const pn = tool.formJson?.projectNumber
                  return pn !== undefined && pn !== null && String(pn).toString().trim() !== ""
                })
                .map((tool) => (
                  <OverheatingToolGridRow onArchiveTool={archiveTool} key={tool.id} overheatingTool={tool} />
                ))
            )}
          </SearchGrid>
          <Flex w={"full"} justifyContent={"space-between"}>
            <PerPageSelect
              handleCountPerPageChange={handleCountPerPageChange}
              countPerPage={countPerPage}
              totalCount={totalCount}
            />
            <Paginator
              current={currentPage}
              total={totalCount}
              totalPages={totalPages}
              pageSize={countPerPage}
              handlePageChange={handlePageChange}
              showLessItems={true}
            />
          </Flex>
        </VStack>
      </Container>
    </Flex>
  )
})
