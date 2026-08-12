// need to dynamically load this file as it is only used in development builds
// we do not want to load this in the production vite build
declare global {
  interface Console {
    tron: any
  }
}

/** Opt out locally with VITE_REACTOTRON=false in .env (restart Vite after changing). */
export const isReactotronEnabled = () => import.meta.env.DEV && import.meta.env.VITE_REACTOTRON !== "false"

export const setupReactotron = async (api) => {
  if (!isReactotronEnabled()) return

  window.global = globalThis
  const { default: reactotron } = await import("reactotron-react-js")
  const { mst } = await import("reactotron-mst")
  const { default: apisaucePlugin } = await import("reactotron-apisauce")

  reactotron
    .configure({ name: "HOUS-permit-portal" })
    .use(apisaucePlugin())
    .use(
      mst({
        filter: (x) =>
          !x.name.endsWith("@APPLY_SNAPSHOT") &&
          !x.name.startsWith("mergeUpdate") &&
          !x.name.endsWith("__beforeMergeUpdate"),
      })
    )
    .connect()

  api.addMonitor(reactotron.apisauce)
  return reactotron
}
