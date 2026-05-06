import { Box, Button, Collapsible, Flex, Heading, List, Text, useDisclosure } from "@chakra-ui/react"
import { CaretDown, CaretUp, WarningCircle } from "@phosphor-icons/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { IErrorsBoxData } from "../../../types/types"
import { ScrollLink } from "../../shared/permit-applications/scroll-link"

interface IErrorBoxProps {
  data: IErrorsBoxData[] //need to add types
}

export const ErrorsBox = ({ data }: IErrorBoxProps) => {
  const { t } = useTranslation()
  const { open, onToggle } = useDisclosure()
  if (data.length == 0) {
    return <React.Fragment key={"errors"}></React.Fragment>
  }
  return (
    <Box
      key={"errors"}
      bgColor={"semantic.errorLight"}
      borderColor={"semantic.error"}
      borderWidth={"1px"}
      borderRadius="lg"
      minH="85px"
      maxH="calc(100vh - 360px)"
      maxW="340px"
      position="fixed"
      right="6"
      top="220px"
      zIndex={14}
      p={4}
      overflowY={"auto"}
      id="floating-side-box"
    >
      <Flex align="center" gap={4}>
        <Box color="semantic.error">
          <WarningCircle size={24} aria-label={"Warning icon"} />
        </Box>
        <Heading as="h4" mb="0" overflowWrap={"break-word"}>
          {t("requirementTemplate.edit.errorsBox.title", { count: data.length })}
        </Heading>
        <Button onClick={onToggle} variant={"plain"} size={"sm"} aria-label={"Open errors"}>
          {open ? <CaretUp /> : <CaretDown />}
        </Button>
      </Flex>
      <Collapsible.Root open={open}>
        <Collapsible.Content>
          <Text fontSize="sm" mt="2">
            {t("requirementTemplate.edit.errorsBox.instructions")}
          </Text>
          <List.Root
            as="ol"
            mt="2"
            ml="0"
            fontSize="sm"
            css={{
              "& li a": {
                color: "text.primary",
              },
            }}
          >
            {data.map((error, index) => (
              <List.Item key={index}>
                <ScrollLink key={error.id} to={error.id}>
                  {error.label}
                </ScrollLink>
              </List.Item>
            ))}
          </List.Root>
        </Collapsible.Content>
      </Collapsible.Root>
    </Box>
  )
}
