import {
  Flex,
  Input,
  InputGroup,
  InputRightElement,
  Popover,
  PopoverContent,
  PopoverTrigger,
  StackDivider,
  VStack,
} from "@chakra-ui/react"
import { CaretDown } from "@phosphor-icons/react"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React from "react"
import { useMst } from "../../../setup/root"
import { EStepCodeCompliancePath } from "../../../types/enums"

interface IProps {
  onChange: (event: any) => void
  value: EStepCodeCompliancePath
}

export const CompliancePathSelect = observer(function CompliancePathSelect({ onChange, value }: IProps) {
  const {
    stepCodeStore: { selectOptions },
  } = useMst()

  return (
    <Popover placement="bottom-end">
      {({ onClose }) => (
        <>
          <PopoverTrigger>
            <InputGroup w={"full"}>
              <Input
                bg="white"
                pointerEvents="none"
                cursor="pointer"
                alignItems="center"
                borderColor="gray.200"
                borderWidth={1}
                rounded="base"
                isReadOnly
                shadow="base"
                placeholder={t("stepCode.import.compliancePath.select")}
                value={value ? t(`stepCode.import.compliancePath.options.${value}`) : ""}
              />
              <InputRightElement children={<CaretDown color="gray.300" />} pointerEvents={"none"} />
            </InputGroup>
          </PopoverTrigger>
          <PopoverContent>
            <VStack align="start" spacing={0} divider={<StackDivider borderColor="border.light" />}>
              {selectOptions.compliancePaths.map((path) => (
                <Flex
                  key={path}
                  onClick={() => {
                    onChange(path)
                    onClose()
                  }}
                  px={2}
                  py={1.5}
                  w="full"
                  cursor="pointer"
                  _hover={{ bg: "hover.blue" }}
                >
                  {t(`stepCode.import.compliancePath.options.${path}`)}
                </Flex>
              ))}
            </VStack>
          </PopoverContent>
        </>
      )}
    </Popover>
  )
})
