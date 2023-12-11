/* tslint:disable */
import { Components } from "formiojs"
import { Constants } from "../Common/Constants.js"
import editForm from "./Component.form.js"
const ParentComponent = Components.components.select
const ID = "simpleselect"
const DISPLAY = "Select List"
export default class Component extends ParentComponent {
  static schema(...extend) {
    return ParentComponent.schema(
      {
        type: ID,
        label: DISPLAY,
        key: ID,
        dataSrc: "values",
        dataType: "auto",
        widget: "choicesjs",
        idPath: "id",
        data: {
          values: [],
          json: "",
          url: "",
          resource: "",
          custom: "",
        },
        clearOnRefresh: false,
        limit: 100,
        valueProperty: "",
        lazyLoad: true,
        filter: "",
        searchEnabled: true,
        searchField: "",
        minSearch: 0,
        readOnlyValue: false,
        authenticate: false,
        template: "<span>{{ item.label }}</span>",
        selectFields: "",
        searchThreshold: 0.3,
        uniqueOptions: false,
        tableView: true,
        fuseOptions: {
          include: "score",
          threshold: 0.3,
        },
        customOptions: {},
      },
      ...extend
    )
  }
  static editForm = editForm
  static get builderInfo() {
    return {
      title: DISPLAY,
      group: "simple",
      icon: "list",
      weight: 3,
      documentation: Constants.DEFAULT_HELP_LINK,
      schema: Component.schema(),
    }
  }
}
