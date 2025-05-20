class AddCachedMetricsJsonToStepCodes < ActiveRecord::Migration[7.1]
  def change
    add_column :step_codes, :cached_metrics_json, :jsonb
    add_column :step_codes, :metrics_cached_at, :datetime
  end
end
