function isTagmeme (msg) {
  return (
    msg &&
    typeof msg.constructor.is === 'function' &&
    typeof msg.constructor.unwrap === 'function' &&
    msg.args.toString() === '[object Arguments]'
  )
}

function getMessageTitle (msg) {
  if (msg === null) {
    return `<span class='AttributedValue--string'>null</span>`
  }
  if (msg === undefined) {
    return `<span class='AttributedValue--string'>undefined</span>`
  }
  if (typeof msg === 'function') {
    let name = 'ƒ'
    const isNamedFunction = typeof msg === 'function' && msg.name
    if (isNamedFunction) {
      name = msg.name
    }
    return `<span class='AttributedValue--function'>${name}</span>()`
  }
  if (typeof msg === 'string') {
    return `<span class='AttributedValue--string'>"${msg}"</span>`
  }
  if (typeof msg === 'number') {
    return `<span class='AttributedValue--number'>${msg}</span>`
  }
  if (isTagmeme(msg)) {
    const tagName = msg.constructor.displayName || msg.constructor.name
    if (msg.args.length) {
      const isComposition = msg.args.length === 1 && isTagmeme(msg.args[0])
      if (isComposition) {
        return `${tagName}∘${getMessageTitle(msg.args[0])}`
      }

      return `<span class='AttributedValue--object'>${tagName}</span> [${[...msg.args].map(getMessageTitle).join(', ')}]`
    }
    return `<span class='AttributedValue--object'>${tagName}</span>`
  }
  if (msg.type) {
    return `{type: ${msg.type}, ...}`
  }
  if (msg.constructor) {
    return msg.constructor.displayName || msg.constructor.name
  }
  const stringVal = msg.toString()
  const isDefaultDescriptor = stringVal.indexOf('[object ') === 0
  if (isDefaultDescriptor) {
    return stringVal.slice(8, -1)
  }
  return stringVal
}

function buildValueTree (val) {
  if (val === null || val === undefined) {
    return {label: `<span class='AttributedValue--special'>${val}</span>`}
  }
  if (typeof val === 'string') {
    return {label: `<span class='AttributedValue--string'>"${val}"</span>`}
  }
  if (typeof val === 'number') {
    return {label: `<span class='AttributedValue--number'>${val}</span>`}
  }
  if (typeof val === 'boolean') {
    return {label: `<span class='AttributedValue--boolean'>${val}</span>`}
  }
  if (typeof val === 'function') {
    let content = val.toString()
    if (content.length > 60) {
      content = content.slice(0, 60) + '… }'
    }
    content = content.replace(/function ?(\w+)/, "<span class='AttributedValue--function'>$1 </span>")
    return {label: content}
  }
  if (typeof val === 'symbol') {
    const name = val.toString().slice(7, -1)
    return {label: `<span class='AttributedValue--special'>@${name}</span>`}
  }
  if (isTagmeme(val)) {
    const tagName = val.constructor.displayName || val.constructor.name
    const isComposition = val.args.length === 1 && isTagmeme(val.args[0])
    if (isComposition) {
      const {label, keyValues} = buildValueTree(val.args[0])
      return {
        label: `<span class='AttributedValue--object'>${tagName}</span> ∘ ${label}`,
        keyValues
      }
    }
    return {
      label: `<span class='AttributedValue--object'>${tagName}</span>`,
      keyValues: Object.entries(val.args).map(([key, value]) => [key, buildValueTree(value)])
    }
  }

  if (typeof val === 'object') {
    const label = getObjectName(val)
    return {
      label: `<span class='AttributedValue--object'>${label}</span>`,
      keyValues: Object.entries(val).map(([key, value]) => [key, buildValueTree(value)])
    }
  }
}

function getObjectName (val) {
  if (val.constructor) {
    const name = val.constructor.displayName || val.constructor.name
    if (name === 'Array' || name === 'Arguments') {
      return `${name}(${val.length})`
    }
    return name
  }
  const stringVal = val.toString()
  const isDefaultDescriptor = stringVal.indexOf('[object ') === 0
  if (isDefaultDescriptor) {
    return stringVal.slice(8, -1)
  }
  return 'Object'
}

function stringifyValueTree (tree) {
  if (tree.keyValues) {
    return [tree.label, tree.keyValues.map(([key, value]) => {
      const [label, children] = stringifyValueTree(value)
      return [
        '<div class="key-line">',
        `<span class='key'><span class='AttributedValue--key'>${key}</span>:</span>`,
        `<span class='value'>${label}<span>`,
        '</div>',
        children ? `<div class='key-values'>${children}</div>` : ''
      ].join('')
    }).join('')]
  }

  return [tree.label]
}

function getPrettyValue (val) {
  const tree = buildValueTree(val)
  const [label, props] = stringifyValueTree(tree)
  return [
    `<div class='key-line'>${label}</div>`,
    props ? `<div class='key-values'>${props}</div>` : ''
  ].join('')
}

module.exports = {
  getMessageTitle,
  getPrettyValue
}
