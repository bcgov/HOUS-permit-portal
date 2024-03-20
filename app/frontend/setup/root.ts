import { Instance } from "mobx-state-tree"
import { useContext } from "react"
import { Environment } from "../models/environment"
import { Api } from "../services/api"
import * as Monitors from "../services/api/monitors"
import { IRootStore, RootStoreModel } from "../stores/root-store"
import { RootStoreContext } from "./root-store-context"

const initialState = {}

const environment = (() => {
  const env = new Environment()
  env.api = new Api()
  return env
})()

export const setupRootStore = () => {
  const rootStore = RootStoreModel.create(initialState, environment)

  const { api } = environment
  const { uiStore, sessionStore } = rootStore

  Monitors.addFlashMessageMonitor(api, uiStore)
  Monitors.addApiErrorMonitor(api, uiStore)
  Monitors.addApiUnauthorizedError(api, sessionStore)

  return rootStore
}

export type RootInstance = Instance<typeof RootStoreModel>

export const Provider = RootStoreContext.Provider

export function useMst(): IRootStore {
  const store = useContext(RootStoreContext) as IRootStore
  if (store === null) {
    throw new Error("Store cannot be null, please add a context provider")
  }
  return store
}

export function useServerAPI() {
  const store = useContext(RootStoreContext) as IRootStore
  // @ts-ignore
  return store.environment.api
}
