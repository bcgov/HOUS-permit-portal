import type React from "react"

type ChakraCompatProps = {
  alignSelf?: unknown
  asChild?: boolean
  bg?: unknown
  color?: unknown
  css?: unknown
  display?: unknown
  fontSize?: unknown
  fontWeight?: unknown
  htmlFor?: string
  lineClamp?: unknown
  maxW?: unknown
  mt?: unknown
  p?: unknown
  pb?: unknown
  shadow?: unknown
  value?: unknown
  w?: unknown
  onSelect?: unknown
}

declare module "@chakra-ui/react" {
  interface ButtonProps {
    leftIcon?: React.ReactNode
    rightIcon?: React.ReactNode
    isDisabled?: boolean
    isLoading?: boolean
    [key: string]: unknown
  }
  interface ButtonGroupProps {
    spacing?: unknown
    disabled?: boolean
  }
  interface BoxProps {
    sx?: unknown
  }
  interface ContainerProps {
    sx?: unknown
  }
  interface FlexProps {
    sx?: unknown
  }
  interface IconButtonProps {
    icon?: React.ReactNode
    isDisabled?: boolean
    isLoading?: boolean
    [key: string]: unknown
  }
  interface IconProps {
    weight?: unknown
  }
  interface ListIndicatorProps {
    weight?: unknown
  }
  interface GridItemProps {
    align?: unknown
    asChild?: boolean
    [key: string]: unknown
  }
  interface AccordionItemProps extends ChakraCompatProps {
    children?: React.ReactNode
    [key: string]: unknown
  }
  interface AccordionItemTriggerProps extends ChakraCompatProps {
    children?: React.ReactNode
    [key: string]: unknown
  }
  interface AccordionItemContentProps extends ChakraCompatProps {
    children?: React.ReactNode
    [key: string]: unknown
  }
  interface AccordionItemIndicatorProps extends ChakraCompatProps {
    children?: React.ReactNode
    [key: string]: unknown
  }
  interface CheckboxControlProps extends ChakraCompatProps {
    children?: React.ReactNode
    [key: string]: unknown
  }
  interface CheckboxLabelProps extends ChakraCompatProps {
    children?: React.ReactNode
    [key: string]: unknown
  }
  interface CheckboxGroupProps extends ChakraCompatProps {
    children?: React.ReactNode
    [key: string]: unknown
  }
  interface DialogCloseTriggerProps extends ChakraCompatProps {
    children?: React.ReactNode
    [key: string]: unknown
  }
  interface DialogBackdropProps extends ChakraCompatProps {
    children?: React.ReactNode
    [key: string]: unknown
  }
  interface DialogPositionerProps extends ChakraCompatProps {
    children?: React.ReactNode
    [key: string]: unknown
  }
  interface DialogContentProps extends ChakraCompatProps {
    children?: React.ReactNode
    [key: string]: unknown
  }
  interface DrawerContentProps extends ChakraCompatProps {
    children?: React.ReactNode
    [key: string]: unknown
  }
  interface DrawerBackdropProps extends ChakraCompatProps {
    children?: React.ReactNode
    [key: string]: unknown
  }
  interface DrawerPositionerProps extends ChakraCompatProps {
    children?: React.ReactNode
    [key: string]: unknown
  }
  interface DrawerCloseTriggerProps extends ChakraCompatProps {
    children?: React.ReactNode
    [key: string]: unknown
  }
  interface FieldLabelProps extends ChakraCompatProps {
    children?: React.ReactNode
    [key: string]: unknown
  }
  interface FieldErrorTextProps extends ChakraCompatProps {
    children?: React.ReactNode
    [key: string]: unknown
  }
  interface FieldHelperTextProps extends ChakraCompatProps {
    children?: React.ReactNode
    [key: string]: unknown
  }
  interface InputProps {
    isDisabled?: boolean
    isReadOnly?: boolean
    onValueChange?: React.ChangeEventHandler<HTMLInputElement>
  }
  interface TextareaProps {
    onValueChange?: React.ChangeEventHandler<HTMLTextAreaElement>
  }
  interface TextProps {
    isTruncated?: boolean
  }
  interface HoverCardTriggerProps extends ChakraCompatProps {
    children?: React.ReactNode
    [key: string]: unknown
  }
  interface HoverCardContentProps extends ChakraCompatProps {
    children?: React.ReactNode
    [key: string]: unknown
  }
  interface MenuTriggerProps extends ChakraCompatProps {
    children?: React.ReactNode
    [key: string]: unknown
  }
  interface MenuPositionerProps extends ChakraCompatProps {
    children?: React.ReactNode
    [key: string]: unknown
  }
  interface MenuContentProps extends ChakraCompatProps {
    children?: React.ReactNode
    [key: string]: unknown
  }
  interface MenuItemProps extends ChakraCompatProps {
    children?: React.ReactNode
    [key: string]: unknown
  }
  interface PopoverTriggerProps extends ChakraCompatProps {
    children?: React.ReactNode
    [key: string]: unknown
  }
  interface PopoverPositionerProps extends ChakraCompatProps {
    children?: React.ReactNode
    [key: string]: unknown
  }
  interface PopoverContentProps extends ChakraCompatProps {
    children?: React.ReactNode
    [key: string]: unknown
  }
  interface PopoverTitleProps extends ChakraCompatProps {
    children?: React.ReactNode
    [key: string]: unknown
  }
  interface PopoverCloseTriggerProps extends ChakraCompatProps {
    children?: React.ReactNode
    [key: string]: unknown
  }
  interface HoverCardPositionerProps extends ChakraCompatProps {
    children?: React.ReactNode
    [key: string]: unknown
  }
  interface CollapsibleContentProps extends ChakraCompatProps {
    children?: React.ReactNode
    [key: string]: unknown
  }
  interface NativeSelectFieldProps extends ChakraCompatProps {
    children?: React.ReactNode
    disabled?: boolean
    onValueChange?: unknown
    [key: string]: unknown
  }
  interface NumberInputControlProps extends ChakraCompatProps {
    children?: React.ReactNode
    [key: string]: unknown
  }
  interface RadioGroupItemProps extends ChakraCompatProps {
    children?: React.ReactNode
    [key: string]: unknown
  }
  interface RadioGroupItemTextProps extends ChakraCompatProps {
    children?: React.ReactNode
    [key: string]: unknown
  }
  interface TabsContentProps extends ChakraCompatProps {
    children?: React.ReactNode
    [key: string]: unknown
  }
  interface TabsContentGroupProps extends ChakraCompatProps {
    children?: React.ReactNode
    [key: string]: unknown
  }
  interface TabsListProps extends ChakraCompatProps {
    children?: React.ReactNode
    [key: string]: unknown
  }
  interface TabsTriggerProps extends ChakraCompatProps {
    children?: React.ReactNode
    [key: string]: unknown
  }
  interface TabsIndicatorProps extends ChakraCompatProps {
    children?: React.ReactNode
    [key: string]: unknown
  }
}
