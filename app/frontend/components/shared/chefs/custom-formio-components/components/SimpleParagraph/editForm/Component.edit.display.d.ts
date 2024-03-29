declare const _default: (
  | {
      key: string
      ignore: boolean
      type?: undefined
      input?: undefined
      editor?: undefined
      rows?: undefined
      as?: undefined
      label?: undefined
      tooltip?: undefined
      defaultValue?: undefined
      weight?: undefined
    }
  | {
      key: string
      ignore: string
      type?: undefined
      input?: undefined
      editor?: undefined
      rows?: undefined
      as?: undefined
      label?: undefined
      tooltip?: undefined
      defaultValue?: undefined
      weight?: undefined
    }
  | {
      type: string
      input: boolean
      editor: string
      rows: number
      as: string
      label: string
      tooltip: string
      defaultValue: string
      key: string
      weight: number
      ignore?: undefined
    }
  | {
      weight: number
      type: string
      label: string
      tooltip: string
      key: string
      input: boolean
      ignore?: undefined
      editor?: undefined
      rows?: undefined
      as?: undefined
      defaultValue?: undefined
    }
)[]
export default _default
