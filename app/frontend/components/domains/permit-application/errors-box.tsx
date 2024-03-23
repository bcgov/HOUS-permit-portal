import { Box, Button, Collapse, Flex, Heading, Text, VStack, useDisclosure } from "@chakra-ui/react"
import { CaretDown, CaretUp, WarningCircle } from "@phosphor-icons/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { IErrorsBoxData } from "../../../types/types"
import { ScrollLink } from "../../shared/permit-applications/scroll-link"

interface IErrorBoxProps {
  errorBox: IErrorsBoxData[] //need to add types
}

export const ErrorsBox = ({ errorBox }: IErrorBoxProps) => {
  const { t } = useTranslation()
  const { isOpen, onToggle } = useDisclosure()
  if (errorBox.length == 0) {
    return <React.Fragment key={"errors"}></React.Fragment>
  }
  return (
    <Box
      key={"errors"}
      bgColor={"semantic.errorLight"}
      borderColor={"semantic.error"}
      borderWidth={"1px"}
      borderRadius="lg"
      maxH="360px"
      position="fixed"
      right="30px"
      top="50%"
      zIndex={14}
      p={4}
      maxW={"300px"}
      overflowY={"auto"}
      id="floating-error-alert-box"
    >
      <Flex align="center" gap={4}>
        <Box color="semantic.error">
          <WarningCircle size={24} aria-label={"Warning icon"} />
        </Box>
        <Heading as="h3" fontSize="md" overflowWrap={"break-word"}>
          {t("requirementTemplate.edit.errorsBox.title", { count: errorBox.length })}
        </Heading>
        <Button
          onClick={onToggle}
          rightIcon={isOpen ? <CaretUp /> : <CaretDown />}
          variant={"unstyled"}
          size={"sm"}
          aria-label={"Open errors"}
        ></Button>
      </Flex>
      <Collapse in={isOpen}>
        <Text>{t("requirementTemplate.edit.errorsBox.instructions")}</Text>
        <VStack alignItems={"flex-start"}>
          {errorBox.map((error, index) => (
            <ScrollLink key={error.id} to={error.id}>{`${index}. ${error.label}`}</ScrollLink>
          ))}
        </VStack>
      </Collapse>
    </Box>
  )
}
