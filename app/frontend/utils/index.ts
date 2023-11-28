import * as humps from "humps"
import * as R from "ramda"

export const camelizeResponse = (data: { [key: string]: any }) => {
  const internalNameCamelizeTransformation = {
    data: {
      customFields: R.map(R.evolve({ internalName: humps.camelize })),
    },
  }

  return R.evolve(
    internalNameCamelizeTransformation,
    humps.camelizeKeys(data, function (key, convert) {
      return convert(key)
    })
  )
}

export const decamelizeRequest = (params: { [key: string]: any }) => {
  return humps.decamelizeKeys(params)
}

export const isNilOrEmpty = (val) => {
  return R.isNil(val) || R.isEmpty(val)
}
