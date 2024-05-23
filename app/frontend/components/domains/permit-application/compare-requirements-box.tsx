import { Box, Button, Flex, Heading, IconButton, ListItem, OrderedList, Text, useDisclosure } from "@chakra-ui/react"
import { CaretDown, CaretUp, Warning } from "@phosphor-icons/react"
import React, { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { useMst } from "../../../setup/root"
import { ICompareRequirementsBoxData } from "../../../types/types"
import { RouterLinkButton } from "../../shared/navigation/router-link-button"
import { ScrollLink } from "../../shared/permit-applications/scroll-link"

interface ICompareRequirementsBoxDataProps {
  data: ICompareRequirementsBoxData[]
  handleUpdatePermitApplicationVersion?: () => void
  showCompareAfter: boolean
}

export const CompareRequirementsBox = ({
  data,
  handleUpdatePermitApplicationVersion,
  showCompareAfter,
}: ICompareRequirementsBoxDataProps) => {
  const { t } = useTranslation()
  const { userStore } = useMst()
  const { currentUser } = userStore

  useEffect(() => {
    const classNames = data.map((obj) => obj.class)
    classNames.forEach((className) => {
      const targetElement = document.getElementsByClassName(className)[0]

      if (targetElement) {
        // debugger
        // targetElement.classList.add("warning-highlight")
        // targetElement.classList.add("warning-highlight")
        targetElement.setAttribute("data-warning", "true")
      }
      // elements.forEach((element) => {
      // })
    })
  }, [data])

  const { isOpen, onToggle } = useDisclosure({ defaultIsOpen: true })
  if (data.length === 0) {
    return <React.Fragment key={"errors"}></React.Fragment>
  }

  return (
    <Box
      key={"template-changes"}
      bgColor={"semantic.warningLight"}
      borderColor={"semantic.warning"}
      borderWidth={"1px"}
      borderRadius="lg"
      minH="85px"
      maxH="calc(100vh - 360px)"
      w="340px"
      position="fixed"
      right="6"
      top="220px"
      zIndex={11}
      id="floating-side-box"
      overflow="hidden"
      p={0}
    >
      <Box p={4}>
        <Flex direction="column">
          <Flex align="center" justify="space-between">
            <Box color={"semantic.warning"}>
              <Warning size={24} aria-label={"warning icon"} />
            </Box>
            <Heading as="h3" mb="0" fontSize="xl" overflowWrap={"break-word"}>
              {t("requirementTemplate.edit.diffBox.title")}
            </Heading>
            <IconButton
              onClick={onToggle}
              icon={isOpen ? <CaretUp /> : <CaretDown />}
              variant={"secondary"}
              size={"sm"}
              aria-label={"Open errors"}
            ></IconButton>
          </Flex>
          {currentUser.isSubmitter ? (
            <Button
              variant="primary"
              alignSelf="center"
              mt={2}
              color="greys.white"
              onClick={handleUpdatePermitApplicationVersion}
            >
              {showCompareAfter ? t("ui.dismiss") : t("permitApplication.updateToNewVersion")}
            </Button>
          ) : (
            <RouterLinkButton to="#" alignSelf="center" mt={2} color="greys.white">
              {t("ui.dismiss")}
            </RouterLinkButton>
          )}
        </Flex>
      </Box>
      <Box
        overflowY="auto"
        p={4}
        maxH={`calc(100vh - 360px - 85px)`}
        display={isOpen ? "block" : "none"}
        borderTop="1px solid"
        borderColor="semantic.warning"
      >
        <Text fontSize="sm" mt="2">
          {t("requirementTemplate.edit.diffBox.instructions")}
        </Text>

        <OrderedList
          mt="2"
          ml="0"
          fontSize="sm"
          sx={{
            "li a": {
              color: "text.primary",
            },
          }}
        >
          {data.map((item, index) => {
            return (
              <ListItem key={index}>
                <ScrollLink key={item.id} to={item.class}>
                  {item.label}
                </ScrollLink>
              </ListItem>
            )
          })}
        </OrderedList>
      </Box>
    </Box>
  )
}
