import { IconButton, Tag } from "@chakra-ui/react"
import { Tag as TagIcon, X as XIcon } from "@phosphor-icons/react"
import debounce from "lodash/debounce"
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
        <TagIcon size={"12px"} style={{ marginRight: "0.5rem" }} />
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
      {/*  @ts-ignore*/}
      <IconButton
        size={"xxs"}
        bg={"greys.grey03"}
        aria-label={"remove association"}
        icon={<XIcon size={14} />}
        sx={{ visibility: "var(--association-remove-icon-visibility)" }}
        {...props?.removeProps}
      />
    </Tag>
  )
}

const Control = ({ children, ...props }: ControlProps<IOption>) => {
  return (
    <components.Control {...props}>
      <TagIcon size={"16.7px"} />
      {children}
    </components.Control>
  )
}
