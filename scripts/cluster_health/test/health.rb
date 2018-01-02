require_relative "../lib/health_check"
require "test/unit"

class Health_Check_Test < Test::Unit::TestCase

  def test_ok
    puts " if all ok, it does nothing"
  
    HealthCheck.run(7000)
  end

end