import { defaultNS, fallbackNS, TTranslationResources } from "../i18n/i18n"

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: typeof defaultNS
    fallbackNS: typeof fallbackNS
    resources: TTranslationResources["en"]
  }
}
