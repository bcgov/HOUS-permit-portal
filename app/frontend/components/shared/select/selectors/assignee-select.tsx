import {
  Avatar,
  Box,
  Button,
  HStack,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Portal,
  Text,
  Tooltip,
} from "@chakra-ui/react"
import { CaretDown, MagnifyingGlass } from "@phosphor-icons/react"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import * as R from "ramda"
import React, { useRef, useState } from "react"
import Select, { components } from "react-select"
import { useMst } from "../../../../setup/root"
import { IOption } from "../../../../types/types"
import { SharedSpinner } from "../../base/shared-spinner"
import { ConditionalWrapper } from "../../conditional-wrapper"
import { UserCard } from "../../user/user-card"

interface IAssigneeSelectProps {
  onChange: (assigneeId: string) => void
  tooltip?: string
  defaultValue?: IOption
  label?: string
  compact?: boolean
  placeholder?: JSX.Element
  avatarProps?: { [key: string]: any }
  options: IOption[]
  [x: string]: any // allow ReactSelect props
}

export const AssigneeSelect = observer(
  (props: IAssigneeSelectProps) => {
    const { userStore } = useMst()
    const [selectedOption, setSelectedOption] = useState(props.defaultValue)

    const { dropdownTargetProps, components, onChange, compact, placeholder, avatarProps, options, ...rest } = props
    const selectRef = useRef()
    const selectedUser = selectedOption && userStore.getUser(selectedOption.value)

    const handleChange = (option: IOption) => {
      setSelectedOption(option)
      props.onChange(option.value)
    }

    if (!options) return <SharedSpinner />

    return (
      <Popover
        initialFocusRef={selectRef}
        isOpen={props.isDisabled === true ? false : undefined}
        placement="bottom-end"
        isLazy
      >
        {({ isOpen, onClose }) => (
          <>
            <ConditionalWrapper
              condition={!R.isNil(props.tooltip)}
              wrapper={(children) => (
                <Tooltip label={props.tooltip}>
                  {/* <Box> wrapper is required so tooltip and popover don't share the same trigger DOM element */}
                  {/* see: https://github.com/chakra-ui/chakra-ui/issues/2843 */}
                  <Box>{children}</Box>
                </Tooltip>
              )}
            >
              <PopoverTrigger>
                <Button
                  rightIcon={<CaretDown size="12px" color={selectedOption?.value ? "greys.grey03" : "text.link"} />}
                  variant="select"
                  minW="120px"
                >
                  <UserCard
                    user={selectedUser}
                    compact={compact}
                    placeholder={
                      placeholder || (
                        <Text color="utility.link" fontSize="xs" lineHeight={6}>
                          {t("ui.unassigned")}
                        </Text>
                      )
                    }
                    avatarProps={avatarProps}
                  />
                </Button>
              </PopoverTrigger>
            </ConditionalWrapper>
            <Portal>
              <PopoverContent width="3xs">
                <PopoverArrow />
                <PopoverBody p={0}>
                  <Select
                    ref={selectRef}
                    controlShouldRenderValue={false}
                    isClearable={false}
                    hideSelectedOptions={false}
                    menuIsOpen
                    value={selectedOption}
                    onChange={(val) => {
                      onClose()
                      handleChange(val)
                    }}
                    options={options}
                    isOptionDisabled={(option) => option.value === selectedOption?.value}
                    placeholder={t("user.assignTo")}
                    //@ts-ignore
                    dropdownTargetProps={{
                      rightIcon: <CaretDown />,
                      variant: "link",
                      color: "text.link",
                      label: props.label || t("ui.unassigned"),
                      ...dropdownTargetProps,
                    }}
                    components={{
                      Control,
                      MultiValue,
                      DropdownIndicator: null,
                      IndicatorSeparator: null,
                      Option: Option,
                      ...components,
                    }}
                    styles={{
                      control: (css, state) => ({
                        ...css,
                        paddingLeft: 8,
                        paddingRight: 8,
                        border: 0,
                        borderBottomRightRadius: 0,
                        borderBottomLeftRadius: 0,
                        boxShadow: "var(--chakra-shadows-md)",
                      }),
                      menu: (css, state) => ({
                        boxShadow: "inset 0 1px 0 rgba(0, 0, 0, 0.1)",
                      }),
                      option: (css, state) => ({
                        ...css,
                        backgroundColor:
                          //@ts-ignore
                          state.isSelected && state.value ? "var(--chakra-colors-background-yellow)" : "transparent",
                        color: "var(--chakra-colors-gray-400)",
                        cursor: state.isSelected ? "auto" : "pointer",
                        //@ts-ignore
                        borderTopWidth: state.value ? 0 : 1,
                        "&:hover": {
                          backgroundColor: "var(--chakra-colors-gray-100)",
                        },
                      }),
                      valueContainer: (css, state) => ({
                        ...css,
                        padding: "0px 8px",
                      }),
                      input: (css, state) => ({
                        ...css,
                        fontSize: "var(--chakra-fontSizes-sm)",
                      }),
                    }}
                    {...rest}
                  />
                </PopoverBody>
              </PopoverContent>
            </Portal>
          </>
        )}
      </Popover>
    )
  },
  { forwardRef: true }
)

const Option = (props) => {
  const { userStore } = useMst()
  const user = userStore.getUser(props.value)

  return (
    <components.Option {...props}>
      {user ? (
        <HStack>
          <Avatar src={user.avatarImage?.url} name={user.name} size="xs" />
          <Text fontSize="xs" color="black" fontWeight="bold">
            {user.name}
          </Text>
        </HStack>
      ) : (
        <Text
          minH={4}
          textTransform="uppercase"
          fontFamily="heading"
          fontSize="xs"
          lineHeight="none"
          color="text.link"
          fontWeight="bold"
        >
          {t("ui.unassign")}
        </Text>
      )}
    </components.Option>
  )
}

const MultiValue = (props) => (
  <components.MultiValue {...props}>
    <span>{props.data.label}</span>
  </components.MultiValue>
)

const Control = ({ children, ...props }) => {
  return (
    // @ts-ignore
    <components.Control {...props}>
      <MagnifyingGlass size="14px" />
      {children}
    </components.Control>
  )
}
