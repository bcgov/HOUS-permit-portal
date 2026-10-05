import { destroy, getEnv, IAnyModelType, Instance } from "mobx-state-tree"
import { useEffect, useState } from "react"
import { useMst } from "../setup/root"
import { IRootStore } from "../stores/root-store"

/** Creates a short-lived MST model with the app environment + rootStore in env; destroyed on unmount. */
export function useEphemeralMstModel<T extends IAnyModelType>(modelProp: T): Instance<T> {
  const rootStore = useMst()
  const [model] = useState(() => modelProp.create({}, { ...getEnv(rootStore), rootStore }))

  useEffect(() => {
    return () => {
      destroy(model)
    }
  }, [model])

  return model
}

export type TEphemeralEnv = { rootStore: IRootStore }
