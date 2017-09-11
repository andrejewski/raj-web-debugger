const test = require('ava')
const debug = require('../src')

test('rajWebDebugger() returns a Raj program', t => {
  const inputProgram = {
    init: [],
    update () { return [] },
    view () {}
  }

  const outputProgram = debug(inputProgram)

  t.true(Array.isArray(outputProgram.init))
  t.is(typeof outputProgram.update, 'function')
  t.is(typeof outputProgram.view, 'function')
})
