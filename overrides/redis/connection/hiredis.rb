class Redis::Connection::Hiredis
  # This class intentionally left blank to shadow the actual 'hiredis' gem

  # This file was created for the error:
  # LoadError: cannot load such file -- redis/connection/hiredis (LoadError)

  # This occurs because simple-feed gem uses a version of redis which is expected
  # to provide redis/connection/hiredis (redis 4)

  # Commenting out:
  # require 'redis/connection/hiredis'
  # in the simple feed gem code directly obviates this issue when running locally.

  # We decided to shadow this file here instead of forking the gem.
  # The overrides folder was manually added to the LOAD_PATH, see: config/boot.rb

  # See https://github.com/kigster/simple-feed/issues/33
  # At time of writing this gem is falling behind in maintenance and
  # does not properly support redis 5
end
