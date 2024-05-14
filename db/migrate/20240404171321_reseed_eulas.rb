class ReseedEulas < ActiveRecord::Migration[7.1]
  def change
    EulaUpdater.run
  end
end
