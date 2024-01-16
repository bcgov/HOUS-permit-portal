import { IconButton, Tag } from "@chakra-ui/react"
import { faClose, faTag } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { debounce } from "lodash"
import { observer } from "mobx-react-lite"
import React, { useCallback } from "react"
import { ControlProps, MultiValueProps, OptionProps, components } from "react-select"
import { IOption } from "../../../../types/types"
import { AsyncSelect, TAsyncSelectProps } from "../async-select"

type TTagsSelectProps = {
  fetchOptions: (query: string) => Promise<IOption[]>
  onChange: (options: IOption[]) => void
  selectedOptions?: IOption[]
} & Partial<TAsyncSelectProps>

export const TagsSelect = observer(
  ({ fetchOptions, onChange, selectedOptions, stylesToMerge, ...rest }: TTagsSelectProps) => {
    const fetchTagOptions = (val: string, callback: (options) => void) => {
      fetchOptions(val).then((options: IOption[]) => {
        callback(options)
      })
    }
    const debouncedFetchOptions = useCallback(debounce(fetchTagOptions, 400), [])

    return (
      <AsyncSelect<IOption, boolean>
        isClearable={false}
        isMulti
        onChange={(opts: IOption[]) => {
          onChange(opts)
        }}
        placeholder="Assign associations"
        value={selectedOptions}
        defaultValue={selectedOptions}
        components={{
          Control,
          Option,
          MultiValue,
        }}
        stylesToMerge={{
          control: {
            height: undefined,
            paddingInline: "0.75rem",
          },
          menu: {
            width: "100%",
            background: "var(--chakra-colors-greys-grey10)",
          },
          ...stylesToMerge,
        }}
        defaultOptions
        loadOptions={debouncedFetchOptions}
        closeMenuOnSelect={false}
        isCreatable
        {...rest}
      />
    )
  }
)

const Option = (props: OptionProps<IOption>) => {
  return (
    <components.Option {...props}>
      <Tag bg={"greys.grey03"} color={"text.secondary"} fontSize={"xs"}>
        <FontAwesomeIcon icon={faTag} style={{ width: "12px", height: "12px", marginRight: "0.5rem" }} />
        {props.label}
      </Tag>
    </components.Option>
  )
}

const MultiValue = (props: MultiValueProps<IOption>) => {
  return (
    <Tag
      bg={"greys.grey03"}
      color={"text.secondary"}
      fontSize={"xs"}
      sx={{
        "--association-remove-icon-visibility": "hidden",
        _hover: {
          "--association-remove-icon-visibility": "visible",
        },
      }}
      mx={1}
      py={1}
    >
      {props.data.label}
      <IconButton
        {...props?.removeProps}
        size={"xxs"}
        bg={"greys.grey03"}
        aria-label={"remove association"}
        icon={<FontAwesomeIcon icon={faClose} style={{ width: "14px", height: "14px" }} />}
        sx={{ visibility: "var(--association-remove-icon-visibility)" }}
      />
    </Tag>
  )
}

const Control = ({ children, ...props }: ControlProps<IOption>) => {
  return (
    <components.Control {...props}>
      <FontAwesomeIcon icon={faTag} style={{ width: "16.7px", height: "16.7px" }} />
      {children}
    </components.Control>
  )
}
