import {
  Flex,
  Input,
  InputGroup,
  InputRightElement,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Portal,
  VStack,
} from "@chakra-ui/react"
import { CaretDown } from "@phosphor-icons/react"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React from "react"
import { useMst } from "../../../../../../../setup/root"
import { EZeroCarbonStep } from "../../../../../../../types/enums"
import { ConditionalWrapper } from "../../../../../../shared/conditional-wrapper"
import { i18nPrefix } from "../i18n-prefix"

interface IProps {
  onChange: (event: any) => void
  value: EZeroCarbonStep
  isDisabled?: boolean
  allowNull?: boolean
  portal?: boolean
}

export const ZeroCarbonStepSelect = observer(function ZeroCarbonStepSelect({
  onChange,
  value,
  isDisabled,
  allowNull,
  portal,
}: IProps) {
  const {
    stepCodeStore: { getZeroCarbonStepOptions },
  } = useMst()

  const options = getZeroCarbonStepOptions(allowNull)
  console.log("*** value", value)

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
                {value === undefined || value === null
                  ? t(`ui.selectPlaceholder`)
                  : t(`${i18nPrefix}.stepRequired.zeroCarbon.options.${value}`)}
              </Input>
              <InputRightElement children={<CaretDown color="gray.300" />} />
            </InputGroup>
          </PopoverTrigger>
          <ConditionalWrapper condition={portal} wrapper={(children) => <Portal>{children}</Portal>}>
            <PopoverContent>
              <VStack align="start" spacing={0}>
                {options.map((value, i) => (
                  <Flex
                    key={value}
                    onClick={() => {
                      onChange(value)
                      onClose()
                    }}
                    px={2}
                    py={1.5}
                    w="full"
                    borderTopWidth={value ? undefined : 1}
                    borderColor="border.light"
                    cursor="pointer"
                    _hover={{ bg: "hover.blue" }}
                  >
                    {value
                      ? t(`${i18nPrefix}.stepRequired.zeroCarbon.options.${value}`)
                      : t(`${i18nPrefix}.notRequired`)}
                  </Flex>
                ))}
              </VStack>
            </PopoverContent>
          </ConditionalWrapper>
        </>
      )}
    </Popover>
  )
})
