process.env = {
  ...process.env,
  'THIS_ACTION_DIR': __dirname,
  'INPUT_VERSION': '3.2.1',
  'INPUT_RELEASE_TYPE': 'stable',
  'INPUT_PATH': 'C:\\Users\\User\\Documents\\GitHub\\godot-ci\\test\\test-project',
  'INPUT_IS-MONO': 'false',
  'INPUT_IMPORT-TIME': '10',
  'INPUT_TEST-TIMEOUT': '10',
  'INPUT_MINIMUM-PASS': '1',
  'INPUT_TEST-DIR': 'test',
  'INPUT_DIRECT-SCENE': '',
  'INPUT_ASSERT-CHECK': 'false',
  'INPUT_MAX-FAILS': '0',
  'INPUT_CONFIG-FILE': '',
  'INPUT_CUSTOM-GODOT-DL-URL': '',
  'INPUT_RESULT-OUTPUT-FILE': '',
};

jest.mock('fs', () => ({
  promises: {
    access: jest.fn(),
  },
}));

jest.mock('https');
