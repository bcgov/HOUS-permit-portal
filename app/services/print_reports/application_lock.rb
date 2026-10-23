module PrintReports
  # Session lock spans rendering/uploads without keeping a database transaction
  # open. All PDF/package entry points share it; PostgreSQL releases it on crash.
  class ApplicationLock
    def self.synchronize(application_id)
      key =
        Digest::SHA256.digest("print-reports:#{application_id}").unpack1("q>")
      ActiveRecord::Base.connection_pool.with_connection do |connection|
        connection.execute("SELECT pg_advisory_lock(#{key})")
        begin
          yield
        ensure
          connection.execute("SELECT pg_advisory_unlock(#{key})")
        end
      end
    end
  end
end
