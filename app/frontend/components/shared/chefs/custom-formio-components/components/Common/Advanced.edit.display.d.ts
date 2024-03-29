declare const _default: (
  | {
      weight: number
      type: string
      input: boolean
      key: string
      label: string
      placeholder: string
      tooltip: string
      validate: {
        required: boolean
        min?: undefined
        max?: undefined
      }
      defaultValue?: undefined
      dataSrc?: undefined
      data?: undefined
      clearOnHide?: undefined
      suffix?: undefined
      conditional?: undefined
      editor?: undefined
      as?: undefined
      wysiwyg?: undefined
      refreshOn?: undefined
      rows?: undefined
      validation?: undefined
    }
  | {
      type: string
      input: boolean
      key: string
      label: string
      tooltip: string
      weight: number
      defaultValue: string
      dataSrc: string
      data: {
        values: {
          label: string
          value: string
        }[]
      }
      placeholder?: undefined
      validate?: undefined
      clearOnHide?: undefined
      suffix?: undefined
      conditional?: undefined
      editor?: undefined
      as?: undefined
      wysiwyg?: undefined
      refreshOn?: undefined
      rows?: undefined
      validation?: undefined
    }
  | {
      type: string
      input: boolean
      key: string
      label: string
      tooltip: string
      clearOnHide: boolean
      weight: number
      placeholder: string
      suffix: string
      validate: {
        min: number
        max: number
        required?: undefined
      }
      conditional: {
        json: {
          and: {
            "!==": (
              | string
              | {
                  var: string
                }
            )[]
          }[]
        }
      }
      defaultValue?: undefined
      dataSrc?: undefined
      data?: undefined
      editor?: undefined
      as?: undefined
      wysiwyg?: undefined
      refreshOn?: undefined
      rows?: undefined
      validation?: undefined
    }
  | {
      weight: number
      type: string
      input: boolean
      key: string
      label: string
      placeholder: string
      tooltip: string
      validate?: undefined
      defaultValue?: undefined
      dataSrc?: undefined
      data?: undefined
      clearOnHide?: undefined
      suffix?: undefined
      conditional?: undefined
      editor?: undefined
      as?: undefined
      wysiwyg?: undefined
      refreshOn?: undefined
      rows?: undefined
      validation?: undefined
    }
  | {
      weight: number
      type: string
      input: boolean
      key: string
      label: string
      placeholder: string
      tooltip: string
      editor: string
      as: string
      wysiwyg: {
        minLines: number
        isUseWorkerDisabled: boolean
      }
      validate?: undefined
      defaultValue?: undefined
      dataSrc?: undefined
      data?: undefined
      clearOnHide?: undefined
      suffix?: undefined
      conditional?: undefined
      refreshOn?: undefined
      rows?: undefined
      validation?: undefined
    }
  | {
      weight: number
      type: string
      input: boolean
      key: string
      label: string
      placeholder?: undefined
      tooltip?: undefined
      validate?: undefined
      defaultValue?: undefined
      dataSrc?: undefined
      data?: undefined
      clearOnHide?: undefined
      suffix?: undefined
      conditional?: undefined
      editor?: undefined
      as?: undefined
      wysiwyg?: undefined
      refreshOn?: undefined
      rows?: undefined
      validation?: undefined
    }
  | {
      weight: number
      type: string
      input: boolean
      key: string
      label: string
      placeholder: string
      tooltip: string
      defaultValue: string
      onChange(context: any): void
      dataSrc: string
      data: {
        values: {
          label: string
          value: string
        }[]
      }
      validate?: undefined
      clearOnHide?: undefined
      suffix?: undefined
      conditional?: undefined
      editor?: undefined
      as?: undefined
      wysiwyg?: undefined
      refreshOn?: undefined
      rows?: undefined
      validation?: undefined
    }
  | {
      weight: number
      type: string
      key: string
      label: string
      refreshOn: string
      clearOnHide: boolean
      input: boolean
      rows: number
      editor: string
      as: string
      customConditional: (context: any) => boolean
      placeholder?: undefined
      tooltip?: undefined
      validate?: undefined
      defaultValue?: undefined
      dataSrc?: undefined
      data?: undefined
      suffix?: undefined
      conditional?: undefined
      wysiwyg?: undefined
      validation?: undefined
    }
  | {
      weight: number
      type: string
      input: boolean
      key: string
      label: string
      tooltip: string
      customConditional: (context: any) => boolean
      placeholder?: undefined
      validate?: undefined
      defaultValue?: undefined
      dataSrc?: undefined
      data?: undefined
      clearOnHide?: undefined
      suffix?: undefined
      conditional?: undefined
      editor?: undefined
      as?: undefined
      wysiwyg?: undefined
      refreshOn?: undefined
      rows?: undefined
      validation?: undefined
    }
  | {
      weight: number
      type: string
      input: boolean
      key: string
      label: string
      tooltip: string
      validation: {
        maxLength: number
      }
      customConditional: (context: any) => any
      placeholder?: undefined
      validate?: undefined
      defaultValue?: undefined
      dataSrc?: undefined
      data?: undefined
      clearOnHide?: undefined
      suffix?: undefined
      conditional?: undefined
      editor?: undefined
      as?: undefined
      wysiwyg?: undefined
      refreshOn?: undefined
      rows?: undefined
    }
  | {
      weight: number
      type: string
      label: string
      tooltip: string
      key: string
      input: boolean
      placeholder?: undefined
      validate?: undefined
      defaultValue?: undefined
      dataSrc?: undefined
      data?: undefined
      clearOnHide?: undefined
      suffix?: undefined
      conditional?: undefined
      editor?: undefined
      as?: undefined
      wysiwyg?: undefined
      refreshOn?: undefined
      rows?: undefined
      validation?: undefined
    }
  | {
      weight: number
      type: string
      input: boolean
      key: string
      defaultValue: boolean
      label: string
      placeholder?: undefined
      tooltip?: undefined
      validate?: undefined
      dataSrc?: undefined
      data?: undefined
      clearOnHide?: undefined
      suffix?: undefined
      conditional?: undefined
      editor?: undefined
      as?: undefined
      wysiwyg?: undefined
      refreshOn?: undefined
      rows?: undefined
      validation?: undefined
    }
  | {
      type: string
      input: boolean
      key: string
      label: string
      tooltip: string
      dataSrc: string
      data: {
        values: {
          label: string
          value: string
        }[]
      }
      weight: number
      placeholder?: undefined
      validate?: undefined
      defaultValue?: undefined
      clearOnHide?: undefined
      suffix?: undefined
      conditional?: undefined
      editor?: undefined
      as?: undefined
      wysiwyg?: undefined
      refreshOn?: undefined
      rows?: undefined
      validation?: undefined
    }
)[]
export default _default
