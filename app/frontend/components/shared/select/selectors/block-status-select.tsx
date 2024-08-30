import { Button, HStack, Menu, MenuButton, MenuItem, MenuList, Portal, Text } from "@chakra-ui/react"
import { CaretDown } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useMemo, useRef } from "react"
import { useTranslation } from "react-i18next"
import { v4 as uuidv4 } from "uuid"
import { EPermitBlockStatus } from "../../../../types/enums"

interface IProps {
  value: EPermitBlockStatus | undefined
  onChange: (value: EPermitBlockStatus) => void
  isTriggerDisabled?: boolean
  isSelectionDisabled?: boolean
}

const statuses = Object.values(EPermitBlockStatus)

const statusColors = {
  [EPermitBlockStatus.draft]: "greys.grey03",
  [EPermitBlockStatus.inProgress]: "semantic.warningLight",
  [EPermitBlockStatus.ready]: "semantic.successLight",
}

export const BlockStatusSelect = observer(function BlockStatusSelect({
  value = EPermitBlockStatus.draft,
  onChange,
  isSelectionDisabled,
  isTriggerDisabled,
}: IProps) {
  const { t } = useTranslation()
  const btnRef = useRef<HTMLButtonElement>()
  const getLabel = (status: EPermitBlockStatus | undefined) =>
    t(`permitCollaboration.blockStatus.${status || EPermitBlockStatus.draft}`)
  const uniqueId = useMemo(uuidv4, [])
  const selectId = `block-status-select-${uniqueId}`
  const labelId = `block-status-select-label-${uniqueId}`

  return (
    <HStack>
      <Text
        as={"label"}
        htmlFor={selectId}
        id={labelId}
        fontWeight={400}
        textTransform={"uppercase"}
        fontSize={"0.625rem"}
        color={"text.secondary"}
        onClick={() => btnRef.current?.focus()}
      >
        {t("permitCollaboration.status")}
      </Text>
      <Menu>
        <MenuButton
          id={selectId}
          ref={btnRef}
          aria-labelledby={labelId}
          as={Button}
          aria-haspopup={"listbox"}
          fontSize={"sm"}
          lineHeight="27px"
          borderRadius="sm"
          px={2}
          py={0}
          h={"fit-content"}
          border={"1px solid"}
          borderColor="border.base"
          bg={statusColors[value]}
          sx={{
            "&:focus": { borderColor: "focus" },
          }}
          rightIcon={<CaretDown />}
          onClick={(e) => e.stopPropagation()}
          isDisabled={isTriggerDisabled}
        >
          {getLabel(value)}
        </MenuButton>
        <Portal>
          <MenuList
            aria-multiselectable={false}
            aria-label={"Unit options"}
            role={"listbox"}
            minW={"100px"}
            w={"100px"}
            p={0}
            border={"1px solid"}
            borderColor={"border.base"}
            overflow={"hidden"}
          >
            {statuses.map((status) => (
              <MenuItem
                key={status}
                fontSize={"sm"}
                role={"option"}
                _focus={{ bg: "semantic.infoLight" }}
                bg={statusColors[status]}
                onClick={() => onChange(status)}
                aria-selected={value === status}
                p={2}
                isDisabled={isSelectionDisabled}
              >
                {getLabel(status)}
              </MenuItem>
            ))}
          </MenuList>
        </Portal>
      </Menu>
    </HStack>
  )
})
