import {
  Flex,
  Input,
  InputGroup,
  InputRightElement,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Portal,
  StackDivider,
  VStack,
} from "@chakra-ui/react"
import { CaretDown } from "@phosphor-icons/react"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React from "react"
import { useMst } from "../../../../../../../setup/root"
import { ESZeroCarbonStep } from "../../../../../../../types/enums"
import { i18nPrefix } from "../i18n-prefix"

interface IProps {
  onChange: (event: any) => void
  value: ESZeroCarbonStep
  isDisabled?: boolean
}

export const ZeroCarbonStepSelect = observer(function ZeroCarbonStepSelect({ onChange, value, isDisabled }: IProps) {
  const {
    stepCodeStore: { selectOptions },
  } = useMst()

  return (
    <Popover placement="bottom-end">
      {({ onClose }) => (
        <>
          <PopoverTrigger>
            <InputGroup pointerEvents={isDisabled ? "none" : "auto"}>
              <Input
                as={Flex}
                bg="white"
                cursor="pointer"
                alignItems="center"
                borderColor="gray.200"
                borderWidth={1}
                rounded="base"
                shadow="base"
                isDisabled={isDisabled}
              >
                {value ? t(`${i18nPrefix}.stepRequired.zeroCarbon.options.${value}`) : t(`ui.selectPlaceholder`)}
              </Input>
              <InputRightElement children={<CaretDown color="gray.300" />} />
            </InputGroup>
          </PopoverTrigger>
          <Portal>
            <PopoverContent>
              <VStack align="start" spacing={0} divider={<StackDivider borderColor="border.light" />}>
                {selectOptions.zeroCarbonSteps.map((value) => (
                  <Flex
                    key={value}
                    onClick={() => {
                      onChange(value)
                      onClose()
                    }}
                    px={2}
                    py={1.5}
                    w="full"
                    cursor="pointer"
                    _hover={{ bg: "hover.blue" }}
                  >
                    {t(`${i18nPrefix}.stepRequired.zeroCarbon.options.${value}`)}
                  </Flex>
                ))}
              </VStack>
            </PopoverContent>
          </Portal>
        </>
      )}
    </Popover>
  )
})
