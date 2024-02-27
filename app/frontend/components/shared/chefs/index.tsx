// The custom components in this directory are from the CHEFS codebase https://github.com/bcgov/common-hosted-form-service/tree/master/components
import { Form, Formio } from "@formio/react"
import "./styles.scss"

import ChefsFormioComponents from "./additional-formio"

Formio.use(ChefsFormioComponents)

export { Form, Formio }
