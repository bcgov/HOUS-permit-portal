import { Page, Text, View } from "@react-pdf/renderer"
import { t } from "i18next"
import * as R from "ramda"
import React from "react"
import { IPermitApplication } from "../../../../../models/permit-application"
import { generateUUID } from "../../../../../utils/utility-functions"
import { Footer } from "../shared/footer"
import { styles } from "./styles"

enum EComponentType {
  checkbox = "checkbox",
  container = "container",
  datagrid = "datagrid",
  date = "date",
  fieldset = "fieldset",
  columns = "columns",
  file = "simplefile",
  number = "number",
  panel = "panel",
  select = "select",
  checklist = "selectboxes",
  email = "simpleemail",
  phone = "simplephonenumber",
  text = "simpletextfield",
  textarea = "textarea",
}

export const ApplicationFields = function ApplicationFields({
  permitApplication,
}: {
  permitApplication: IPermitApplication
}) {
  return (
    <Page size="LETTER" style={styles.page}>
      <View style={styles.outerContainer}>
        {permitApplication.formattedFormJson.components.map((c) => (
          <FormComponent key={c.id} component={c} permitApplication={permitApplication} />
        ))}
      </View>
      <Footer permitApplication={permitApplication} />
    </Page>
  )
}

interface IFormComponentProps {
  permitApplication: IPermitApplication
  component: any
  dataPath?: string[]
}
const FormComponent = function ApplicationPDFFormComponent({
  permitApplication,
  component,
  dataPath,
}: IFormComponentProps) {
  const extractFields = (component) => {
    if (component.input) {
      const { isVisible } = extractFieldInfo(component)
      return isVisible && component
    } else if (component.components || component.columns) {
      return R.map(extractFields, component.components || [component.columns[0]])
    }
  }

  const fields = (components: any[]) => {
    return R.flatten(R.map(extractFields, components)).filter((outNull) => outNull)
  }

  const extractFieldInfo = (component) => {
    switch (component.type) {
      case EComponentType.checklist: {
        const options = R.path([dataPath, component.key], permitApplication.submissionData.data)
        const label = component.label
        const values: any = Object.keys(options ?? {}).filter((key) => !!options[key])
        return { options, values, label, isVisible: !R.isEmpty(values) && !R.isNil(label) }
      }
      case EComponentType.datagrid: {
        return { value: null, label: null }
      }
      default:
        const label = component.label
        const value = R.path([...dataPath, component.key], permitApplication.submissionData.data)
        return { value, label, isVisible: !R.isNil(value) && !R.isNil(label) }
    }
  }

  switch (component.type) {
    case EComponentType.container: {
      dataPath = [component.key]
      const componentFields = fields(component.components || component.columns)
      const isValid = !R.isEmpty(component.title.trim()) && componentFields.length > 0
      if (!isValid) return null
      const { components } = component
      const firstChild: any = R.head(components)
      const additionalChildren: any = R.tail(components)
      const firstChildFields = fields(firstChild.components)

      return (
        <View>
          <View wrap={firstChildFields.length > 6}>
            <ContainerHeader component={component} />
            <FormComponent component={firstChild} dataPath={dataPath} permitApplication={permitApplication} />
          </View>
          {additionalChildren.map((child) => (
            <FormComponent
              key={generateUUID()}
              component={child}
              dataPath={dataPath}
              permitApplication={permitApplication}
            />
          ))}
        </View>
      )
    }
    case EComponentType.panel: {
      const numFields = fields(component.components).length
      return (
        <View style={styles.panelContainer} wrap={numFields > 5}>
          <PanelHeader component={component} />
          {component.components && (
            <View style={styles.panelBodyContainer}>
              {component.components.map((child) => (
                <FormComponent
                  key={generateUUID()}
                  component={child}
                  dataPath={dataPath}
                  permitApplication={permitApplication}
                />
              ))}
            </View>
          )}
        </View>
      )
    }
    case EComponentType.datagrid: {
      return (
        <>
          {component.components &&
            component.components.map((child) => (
              <FormComponent
                key={generateUUID()}
                component={child}
                dataPath={[...dataPath, component.key, 0]}
                permitApplication={permitApplication}
              />
            ))}
        </>
      )
    }
    case EComponentType.fieldset:
      const numFields = fields(component.components).length

      return (
        numFields > 0 && (
          <View style={styles.grid}>
            {component.components.map((child) => (
              <FormComponent
                key={generateUUID()}
                component={child}
                dataPath={dataPath}
                permitApplication={permitApplication}
              />
            ))}
          </View>
        )
      )
    case EComponentType.columns:
      return (
        <>
          {component.columns && (
            <View style={styles.row}>
              {component.columns
                .map((column, index) => {
                  return column.components.map((child) => {
                    return (
                      <View key={generateUUID()} style={styles.item}>
                        <FormComponent component={child} dataPath={dataPath} permitApplication={permitApplication} />
                      </View>
                    )
                  })
                })
                .flat()}
            </View>
          )}
        </>
      )
    case EComponentType.file: {
      const { value, label, isVisible } = extractFieldInfo(component)

      return isVisible ? <FileField value={value} label={label} /> : null
    }
    case EComponentType.checklist: {
      const { options, values, label, isVisible } = extractFieldInfo(component)
      return isVisible ? <ChecklistField options={options} label={label} /> : null
    }
    case EComponentType.checkbox: {
      const { value, label, isVisible } = extractFieldInfo(component)
      return isVisible ? <CheckboxField value={value} label={label} /> : null
    }
    case EComponentType.select:
    case EComponentType.text:
    case EComponentType.textarea:
    case EComponentType.number:
    case EComponentType.phone:
    case EComponentType.date:
    case EComponentType.email: {
      const { value, label, isVisible } = extractFieldInfo(component)
      return isVisible ? <InputField value={value} label={label} type={component.type} /> : null
    }
    default:
      import.meta.env.DEV && console.log("[DEV]: missing component", component)
      return null
  }
}

const ContainerHeader = function ApplicationPDFContainerHeader({ component }) {
  return (
    <View style={styles.sectionHeaderContainer} wrap={false}>
      <View style={styles.sectionHeaderLine} />
      <Text style={styles.sectionHeading}>{component.title}</Text>
    </View>
  )
}

const PanelHeader = function ApplicationPDFPanelHeader({ component }) {
  return (
    <View style={styles.panelHeaderContainer} fixed>
      <Text style={styles.panelHeading}>{component.title}</Text>
    </View>
  )
}

const ChecklistField = function ApplicationPDFPanelChecklistField({ options, label }) {
  return (
    <View style={styles.requirementFieldContainer} wrap={false}>
      <Text style={styles.requirementFieldLabel}>{label}</Text>
      <View style={styles.requirementFieldChecklist}>
        {Object.keys(options).map((key) => {
          return (
            <View key={key} style={styles.requirementFieldChecklistItem}>
              {options[key] ? (
                <View style={styles.requirementFieldCheckboxFilled} />
              ) : (
                <View style={styles.requirementFieldCheckboxOutline} />
              )}
              <Text style={styles.requirementFieldInputValue}>{key}</Text>
            </View>
          )
        })}
      </View>
    </View>
  )
}

const CheckboxField = function ApplicationPDFPanelCheckboxField({ value, label }) {
  return (
    <View style={styles.requirementFieldContainer} wrap={false}>
      <View style={styles.requirementFieldChecklistItem}>
        {value ? (
          <View style={styles.requirementFieldCheckboxFilled} />
        ) : (
          <View style={styles.requirementFieldCheckboxOutline} />
        )}
        <Text style={styles.requirementFieldInputValue}>{label}</Text>
      </View>
    </View>
  )
}

const InputField = function ApplicationPDFInputField({ value, label, type }) {
  return (
    <View style={styles.requirementFieldContainer} wrap={false}>
      <Text style={styles.requirementFieldLabel}>{label}</Text>
      <View style={styles.requirementFieldInput}>
        <Text style={styles.requirementFieldInputValue}>{value}</Text>
      </View>
    </View>
  )
}

const FileField = function ApplicationPDFFileField({ value, label }: { value: Record<string, any>[]; label: string }) {
  const fileExists = value && !R.isEmpty(value)

  return (
    <View style={styles.requirementFieldContainer} wrap={false}>
      <Text style={styles.requirementFieldLabel}>{label}</Text>
      <View style={styles.requirementFieldInput}>
        {fileExists ? (
          <Text style={styles.requirementFieldInputValue}>{R.pluck("originalName", value).join(", ")}</Text>
        ) : (
          <Text style={styles.requirementFieldInputValue}>{t("permitApplication.pdf.fileNotAdded")}</Text>
        )}
      </View>
    </View>
  )
}
