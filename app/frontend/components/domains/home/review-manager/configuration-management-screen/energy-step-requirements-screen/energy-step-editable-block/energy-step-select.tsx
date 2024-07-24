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
import { EEnergyStep } from "../../../../../../../types/enums"
import { i18nPrefix } from "../i18n-prefix"

interface IProps {
  onChange: (event: any) => void
  value: EEnergyStep
  isDisabled?: boolean
  allowNull?: boolean
}

export const EnergyStepSelect = observer(function EnergyStepSelect({ onChange, value, isDisabled, allowNull }: IProps) {
  const {
    stepCodeStore: { getEnergyStepOptions },
  } = useMst()
  const options = getEnergyStepOptions(allowNull)
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
                {value === undefined
                  ? t(`ui.selectPlaceholder`)
                  : value
                    ? t(`${i18nPrefix}.stepRequired.energy.options.${value}`)
                    : t(`${i18nPrefix}.notRequired`)}
              </Input>
              <InputRightElement children={<CaretDown color="gray.300" />} />
            </InputGroup>
          </PopoverTrigger>
          <Portal>
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
                    {value ? t(`${i18nPrefix}.stepRequired.energy.options.${value}`) : t(`${i18nPrefix}.notRequired`)}
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
