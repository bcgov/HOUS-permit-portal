import { Box, Flex, Heading, IconButton, ListItem, OrderedList, Text, useDisclosure } from "@chakra-ui/react"
import { CaretDown, CaretUp, Warning } from "@phosphor-icons/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { ICompareRequirementsBoxData } from "../../../types/types"
import { RouterLinkButton } from "../../shared/navigation/router-link-button"
import { ScrollLink } from "../../shared/permit-applications/scroll-link"

interface ICompareRequirementsBoxDataProps {
  data: ICompareRequirementsBoxData[]
}

export const CompareRequirementsBox = ({ data }: ICompareRequirementsBoxDataProps) => {
  const { t } = useTranslation()
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
      zIndex={10}
      id="floating-error-alert-box"
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
          <RouterLinkButton to="#" alignSelf="center" mt={1}>
            {t("ui.dismiss")}
          </RouterLinkButton>
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
          {data.map((item, index) => (
            <ListItem key={index}>
              <ScrollLink key={item.id} to={item.id}>
                {item.label}
              </ScrollLink>
            </ListItem>
          ))}
        </OrderedList>
      </Box>
    </Box>
  )
}
