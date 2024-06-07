import { Box, Button, Center, Flex, Hide, ListItem, OrderedList, Spacer, Text } from "@chakra-ui/react"
import { ChatDots, PaperPlaneTilt } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useMountStatus } from "../../../hooks/use-mount-status"
import { IPermitApplication } from "../../../models/permit-application"
import { ScrollLink } from "../../shared/permit-applications/scroll-link"

interface IRevisionSideBarProps {
  permitApplication: IPermitApplication
}

export const RevisionSideBar = observer(({ permitApplication }: IRevisionSideBarProps) => {
  const { t } = useTranslation()
  const isMounted = useMountStatus()

  const [topHeight, setTopHeight] = useState<number>()

  useEffect(() => {
    const permitHeaderHeight = document.getElementById("permitHeader")?.offsetHeight
    setTopHeight(permitHeaderHeight)
  }, [isMounted, window.innerWidth, window.innerHeight])

  return (
    <Hide below="md">
      <Flex
        direction="column"
        boxShadow="md"
        borderRight="1px solid"
        borderRightColor="theme.yellow"
        width="var(--app-sidebar-width)"
        position="sticky"
        top={topHeight}
        bottom="0"
        height={`calc(100vh - ${topHeight}px)`}
        float="left"
        id="permit-revision-sidebar"
        bg="theme.yellowLight"
      >
        <Box overflowY="auto">
          <Center p={8} textAlign="center" borderBottom="1px solid" borderColor="border.light">
            <Text fontStyle="italic">{t("permitApplication.show.clickQuestion")}</Text>
          </Center>
          <OrderedList>
            {permitApplication.stagedRevisionRequests.map((rr) => {
              return (
                <ListItem mb={4}>
                  <ScrollLink to={`formio-component-${rr.requirementJson.key}`}>{rr.requirementJson.label}</ScrollLink>
                  <Flex fontStyle="italic">
                    {t("permitApplication.show.revision.reason")}: {/* @ts-ignore */}
                    {t(`permitApplication.show.revision.reasons.${rr.reasonCode}`)}
                  </Flex>
                  <Flex gap={2} fontStyle="italic" alignItems="center" flexWrap="nowrap">
                    <Box width={6} height={6}>
                      <ChatDots size={24} />
                    </Box>
                    <Text noOfLines={1}>{rr.comment}</Text>
                  </Flex>
                </ListItem>
              )
            })}
          </OrderedList>
        </Box>
        <Spacer />
        <Flex
          direction="column"
          borderTop="1px solid"
          borderColor="border.light"
          p={8}
          gap={4}
          justify="center"
          position="sticky"
          bottom={0}
        >
          <Box>
            <Text as="span" fontWeight="bold">
              {permitApplication.stagedRevisionRequests.length}
            </Text>{" "}
            <Text as="span" color="text.secondary">
              {t("ui.selected")}
            </Text>
          </Box>
          <Flex gap={4}>
            <Button variant="primary" rightIcon={<PaperPlaneTilt />}>
              {t("permitApplication.show.revision.send")}
            </Button>
            <Button variant="secondary">{t("ui.cancel")}</Button>
          </Flex>
        </Flex>
      </Flex>
    </Hide>
  )
})
