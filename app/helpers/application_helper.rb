module ApplicationHelper
  def jira_collector_script_tag
    return unless ENV["VITE_JIRA_COLLECTOR_SCRIPT_SRC"].present?

    script_src = ENV["VITE_JIRA_COLLECTOR_SCRIPT_SRC"]

    # Optional: Set default field values to satisfy required Jira fields
    # Field IDs should be obtained from your Jira admin
    field_values = {}
    field_values["parent"] = ENV["JIRA_DEFAULT_PARENT"] if ENV[
      "JIRA_DEFAULT_PARENT"
    ].present?
    field_values["customfield_xxxxx"] = ENV["JIRA_DEFAULT_STORY_POINTS"] if ENV[
      "JIRA_DEFAULT_STORY_POINTS"
    ].present?
    field_values["customfield_xxxxx"] = ENV["JIRA_DEFAULT_TEAM_AREA"] if ENV[
      "JIRA_DEFAULT_TEAM_AREA"
    ].present?

    content_tag(:script, type: "text/javascript") { <<~JAVASCRIPT.html_safe } +
        var scriptSrc = #{script_src.to_json};
        var collectorId = new URL(scriptSrc).searchParams.get('collectorId');
        var fieldValues = #{field_values.to_json};
        
        window.ATL_JQ_PAGE_PROPS = {
          collectorId: collectorId,
          triggerFunction: function(showCollectorDialog) {
            window.showCollectorDialog = showCollectorDialog;
          },
          fieldValues: fieldValues
        };
      JAVASCRIPT
      javascript_include_tag(script_src)
  end
end
