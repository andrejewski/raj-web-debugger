function bottomLeftSpawnRect (parentRect, width, height) {
  return {
    top: parentRect.width - width,
    left: parentRect.height - height,
    width,
    height
  }
}

module.exports = {
  getContainerElement (containerMsg) {
    return dispatch => {
      const id = 'raj-web-debugger'
      const existingDebugger = document.getElementById(id)
      if (existingDebugger) {
        throw new Error('Multiple debuggers are not supported')
      }

      const container = document.createElement('div')
      container.id = id
      document.body.appendChild(container)
      dispatch(containerMsg(container))
    }
  },
  openWindow (options) {
    return dispatch => {
      const {
        title,
        width,
        height,
        openMsg,
        closeMsg
      } = options
      const url = ''
      const windowName = ''
      const rect = bottomLeftSpawnRect(window.screen, width, height)
      const windowOptions = `width=${rect.width},height=${rect.height},top=${rect.top},left=${rect.left}`
      const childWindow = window.open(url, windowName, windowOptions)
      const doc = childWindow.document
      doc.title = title
      doc.body.style.padding = '0'
      doc.body.style.margin = '0'

      childWindow._cleanUpUnload = () => {
        childWindow.removeEventListener('unload', childWindow._childUnload)
        childWindow.document.removeEventListener('keydown', childWindow._proxyReload)
        window.removeEventListener('unload', childWindow._parentUnload)
      }
      childWindow._parentUnload = () => {
        childWindow._cleanUpUnload()
        childWindow.close()
      }
      childWindow._childUnload = () => {
        childWindow._cleanUpUnload()
        dispatch(closeMsg())
      }
      childWindow._proxyReload = event => {
        const isReload = event.metaKey && event.which === 82
        if (isReload) {
          window.location.reload()
        }
      }

      window.addEventListener('unload', childWindow._parentUnload)
      childWindow.addEventListener('unload', childWindow._childUnload)
      childWindow.document.addEventListener('keydown', childWindow._proxyReload)
      dispatch(openMsg(childWindow))
    }
  }
}
