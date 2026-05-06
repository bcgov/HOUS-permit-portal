import { InputGroup } from "@/components/ui/input-group"
import { Flex, Input, InputElement, Popover, Portal, VStack } from "@chakra-ui/react"
import { CaretDown } from "@phosphor-icons/react"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React from "react"
import { useMst } from "../../../../../../../setup/root"
import { EEnergyStep } from "../../../../../../../types/enums"
import { ConditionalWrapper } from "../../../../../../shared/conditional-wrapper"
import { i18nPrefix } from "../i18n-prefix"

interface IProps {
  onChange: (event: any) => void
  value: EEnergyStep
  isDisabled?: boolean
  disabled?: boolean
  allowNull?: boolean
  portal?: boolean
}

export const EnergyStepSelect = observer(function EnergyStepSelect({
  onChange,
  value,
  isDisabled,
  disabled,
  allowNull,
  portal,
}: IProps) {
  const {
    stepCodeStore: { getEnergyStepOptions },
  } = useMst()
  const options = getEnergyStepOptions(allowNull)
  return (
    <Popover.Root
      positioning={{
        placement: "bottom-end",
      }}
    >
      <Popover.Context>
        {({ setOpen: setOpen }) => {
          const onClose = () => setOpen(false)

          return (
            <>
              <Popover.Trigger asChild>
                <InputGroup pointerEvents={(disabled ?? isDisabled) ? "none" : "auto"}>
                  <Input
                    bg="white"
                    cursor="pointer"
                    alignItems="center"
                    borderColor="gray.200"
                    borderWidth={1}
                    rounded="base"
                    shadow="base"
                    disabled={disabled ?? isDisabled}
                    asChild
                  >
                    <Flex>
                      {value === undefined
                        ? t(`ui.selectPlaceholder`)
                        : value
                          ? t(`${i18nPrefix}.stepRequired.energy.options.${value}`)
                          : t(`${i18nPrefix}.notRequired`)}
                    </Flex>
                  </Input>
                  <InputElement placement="end" children={<CaretDown color="gray.300" />} />
                </InputGroup>
              </Popover.Trigger>
              <ConditionalWrapper condition={portal} wrapper={(children) => <Portal>{children}</Portal>}>
                <Popover.Positioner>
                  <Popover.Content>
                    <VStack align="start" gap={0}>
                      {options.map((option) => (
                        <Flex
                          key={option}
                          onClick={() => {
                            onChange(option)
                            onClose()
                          }}
                          px={2}
                          py={1.5}
                          w="full"
                          borderTopWidth={option ? undefined : 1}
                          borderColor="border.light"
                          cursor="pointer"
                          _hover={{ bg: "hover.blue" }}
                        >
                          {option
                            ? t(`${i18nPrefix}.stepRequired.energy.options.${option}`)
                            : t(`${i18nPrefix}.notRequired`)}
                        </Flex>
                      ))}
                    </VStack>
                  </Popover.Content>
                </Popover.Positioner>
              </ConditionalWrapper>
            </>
          )
        }}
      </Popover.Context>
    </Popover.Root>
  )
})
