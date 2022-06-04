import unittest

from controllers import hello_world  # does not seem to work without __init__.py


class TestCaseHelloWorld(unittest.TestCase):
    """
    TestCase controllers.hello_world.hello_world.
    """

    def test_something(self):
        """
        Assert output of controllers.hello_world.hello_world.
        """
        self.assertEqual(hello_world.hello_world(), "Hello mister!")
