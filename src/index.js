const {union} = require('tagmeme')
const {mapEffect, batchEffects} = require('raj-compose')
const {embedStyle, debuggerStyle} = require('./style')
const {getMessageTitle, getPrettyValue} = require('./print')
const frame = require('./frame')

const Msg = union([
  'GetContainer',
  'GetWindow',
  'OpenDebugger',
  'ClosedWindow',
  'ProgramMsg',
  'HistoryUp',
  'HistoryDown',
  'HistoryGoTo'
])

function debuggerEmbedView (model, dispatch) {
  if (model.window) {
    return
  }
  const html = document.createElement('div')
  html.innerHTML = `
    <style>${embedStyle}</style>
    <span>Debugger</span>
  `
  html.onclick = () => dispatch(Msg.OpenDebugger())
  return html
}

function debuggerWindowView (model, dispatch) {
  const doc = model.window.document
  const html = doc.createElement('div')
  html.className = 'debugger'
  html.innerHTML = `
    <style>${debuggerStyle}</style>
    <div class='side'>
      <ul>
        <li class='${model.historyIndex === null ? 'active' : ''}'>Live state</li>
        ${model.history.map((entry, index) =>
          `<li class='${model.historyIndex === index ? 'active' : ''}' data-index='${index}'>${index === 0
            ? 'Initial state'
            : getMessageTitle(entry.message)}</li>`
        ).reverse().join('')}
      </ul>
    </div>
    <div class='main'>${(function () {
      const {history, historyIndex} = model
      const entryIndex = historyIndex !== null ? historyIndex : history.length - 1
      const currentEntry = history[entryIndex]
      const previousEntry = history[entryIndex - 1]
      return `
        <section>
          <label>Message</label>
          <div>${getPrettyValue(currentEntry.message)}</div>
        </section>

        <section>
          <label>Input state</label>
          <div>${previousEntry ? getPrettyValue(previousEntry.model) : 'No previous state'}</div>
        </section>

        <section>
          <label>Output state</label>
          <div>${getPrettyValue(currentEntry.model)}</div>
        </section>
      `
    })()}</div>
  `

  function findHistoryItem (target) {
    while (target && target.tagName !== 'LI') {
      target = target.parentNode
    }
    return target
  }

  html.onclick = event => {
    const historyItem = findHistoryItem(event.target)
    if (historyItem) {
      let historyIndex = historyItem.dataset.index || null
      if (historyIndex) {
        historyIndex = parseInt(historyIndex, 10)
      }
      dispatch(Msg.HistoryGoTo(historyIndex))
    }
  }
  model.window.onkeydown = event => {
    const isModified = event.shiftKey && event.metaKey
    if (isModified) {
      return
    }
    const isUp = event.keyCode === 74 // j
    if (isUp) {
      dispatch(Msg.HistoryDown())
    }
    const isDown = event.keyCode === 75 // k
    if (isDown) {
      dispatch(Msg.HistoryUp())
    }
  }
  return html
}

function updateView (container, newChild) {
  if (container.firstChild) {
    container.removeChild(container.firstChild)
  }
  if (newChild) {
    container.appendChild(newChild)
  }
}

function debuggerView (model, dispatch) {
  if (!model.container) {
    return
  }

  if (model.window) {
    if (model.container.firstChild) {
      model.container.removeChild(model.container.firstChild)
    }
  } else {
    const isSetup = model.container.firstChild
    if (!isSetup) {
      const embed = debuggerEmbedView(model, dispatch)
      updateView(model.container, embed)
    }
  }

  if (model.window) {
    const view = debuggerWindowView(model, dispatch)
    updateView(model.window.document.body, view)
  }
}

module.exports = function webDebugger (program, debuggerName) {
  const [programModel, programEffect] = program.init
  const init = [{
    history: [{
      model: programModel
    }],
    historyIndex: null,
    container: null,
    window: null
  }, batchEffects([
    frame.getContainerElement(Msg.GetContainer),
    mapEffect(programEffect, Msg.ProgramMsg)
  ])]

  function update (msg, model) {
    return Msg.match(msg, {
      GetContainer: container => [{...model, container}],
      GetWindow: window => [{...model, window}],
      OpenDebugger: () => [model, frame.openWindow({
        title: 'Debugger',
        width: 960,
        height: 480,
        openMsg: Msg.GetWindow,
        closeMsg: Msg.ClosedWindow
      })],
      ClosedWindow: () => [{
        ...model,
        window: undefined,
        historyIndex: null
      }],
      ProgramMsg: msg => {
        const newestModel = model.history[model.history.length - 1].model
        const [programModel, programEffect] = program.update(msg, newestModel)
        const historyEntry = {
          message: msg,
          model: programModel
        }
        return [{
          ...model,
          history: [...model.history, historyEntry]
        }, mapEffect(programEffect, Msg.ProgramMsg)]
      },
      HistoryUp: () => {
        const currentIndex = model.historyIndex
        const nextIndex = currentIndex === null
          ? null
          : currentIndex + 1 === model.history.length
            ? null
            : currentIndex + 1
        return [{...model, historyIndex: nextIndex}]
      },
      HistoryDown: () => {
        const currentIndex = model.historyIndex
        const previousIndex = currentIndex === null
          ? model.history.length - 1
          : Math.max(0, currentIndex - 1)
        return [{...model, historyIndex: previousIndex}]
      },
      HistoryGoTo: historyIndex => [{...model, historyIndex}]
    })
  }

  function view (model, dispatch) {
    debuggerView(model, dispatch)

    const isLive = model.historyIndex === null
    if (isLive) {
      const newestModel = model.history[model.history.length - 1].model
      return program.view(newestModel, x => dispatch(Msg.ProgramMsg(x)))
    }

    const currentModel = model.history[model.historyIndex].model
    return program.view(currentModel, x => {})
  }

  return {init, update, view}
}
