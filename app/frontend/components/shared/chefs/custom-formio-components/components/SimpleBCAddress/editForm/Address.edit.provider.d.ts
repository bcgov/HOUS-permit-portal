declare const _default: (
  | {
      type: string
      input: boolean
      defaultValue: string
      key: string
      label: string
      placeholder: string
      weight: number
      tooltip: string
      rows?: undefined
      editor?: undefined
      as?: undefined
      description?: undefined
    }
  | {
      type: string
      input: boolean
      key: string
      label: string
      placeholder: string
      weight: number
      rows: number
      editor: string
      as: string
      tooltip: string
      defaultValue?: undefined
      description?: undefined
    }
  | {
      type: string
      input: boolean
      key: string
      label: string
      placeholder: string
      description: string
      weight: number
      rows: number
      editor: string
      tooltip: string
      defaultValue?: undefined
      as?: undefined
    }
)[]
export default _default
