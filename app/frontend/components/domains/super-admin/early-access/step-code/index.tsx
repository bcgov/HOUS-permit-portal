import { Box, Container, Flex, Heading, Text, VStack } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"

import { urlForPath } from "../../../../../utils/utility-functions"
import { CopyLinkButton } from "../../../../shared/base/copy-link-button"
import { GridHeader } from "../../../../shared/grid/grid-header"
import { SearchGrid } from "../../../../shared/grid/search-grid"
import { SearchGridItem } from "../../../../shared/grid/search-grid-item"

export const EarlyAccessStepCodeScreen = observer(function RequirementsLibrary() {
  const { t } = useTranslation()

  return (
    <Container maxW="container.lg" p={8} as="main">
      <VStack alignItems={"flex-start"} spacing={5} w={"full"} h={"full"}>
        <Flex justifyContent={"space-between"} w={"full"} alignItems={"flex-end"} gap={6}>
          <Box>
            <Heading as="h1" color={"text.primary"}>
              {t("home.earlyAccess.stepCode.title")}
            </Heading>
            <Text color={"text.secondary"} mt={1}>
              {t("home.earlyAccess.stepCode.description")}
            </Text>
          </Box>
        </Flex>

        <SearchGrid templateColumns="repeat(2, 1fr)">
          <Box display={"contents"} role={"rowgroup"}>
            <Box display={"contents"} role={"row"}>
              <GridHeader>
                <Text role={"heading"}>{t("home.earlyAccess.stepCode.typeHeading")}</Text>
              </GridHeader>
              <GridHeader key={"shareUrl"} role={"columnheader"}>
                <Text role={"heading"}>{t("home.earlyAccess.stepCode.accessUrl")}</Text>
              </GridHeader>
            </Box>
          </Box>
          <Box key={"part-3"} className={"requirements-template-grid-row"} role={"row"} display={"contents"}>
            <SearchGridItem key={"templateType"}>
              <Text>{t("home.earlyAccess.stepCode.part9")}</Text>
            </SearchGridItem>
            <SearchGridItem key={"shareUrl"}>
              <CopyLinkButton value={urlForPath(`/part-9-step-code`)} size="xs" />
            </SearchGridItem>
          </Box>
          <Box key={"part-9"} className={"requirements-template-grid-row"} role={"row"} display={"contents"}>
            <SearchGridItem key={"templateType"}>
              <Text>{t("home.earlyAccess.stepCode.part3")}</Text>
            </SearchGridItem>
            <SearchGridItem key={"shareUrl"}>
              <CopyLinkButton value={urlForPath(`/part-3-step-code`)} size="xs" />
            </SearchGridItem>
          </Box>
        </SearchGrid>
      </VStack>
    </Container>
  )
})
