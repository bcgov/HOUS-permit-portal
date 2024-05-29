class RemoveBceidBothUsers < ActiveRecord::Migration[7.1]
  def up
    User.where(omniauth_provider: "bceidboth").destroy_all
  end

  def down
  end
end
