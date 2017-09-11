const embedStyle = `
#raj-web-debugger span {
  display: block;
  position: fixed;
  bottom: 0px;
  right: 20px;
  background-color: rgba(0,0,0,0.8);
  border-top-left-radius: 3px;
  border-top-right-radius: 3px;
  padding: 8px 12px;
  font-size: 16px;
  font-family: Helvetica, Arial, sans-serif;
  font-weight: normal;
  text-shadow: 0 0 3px rgba(0,0,0,0.2);
  color: #fff;
  cursor: default;
  user-select: none;
}
#raj-web-debugger span:hover {
  background-color: rgba(0,0,0,0.75);
}
#raj-web-debugger span:active {
  background-color: rgba(0,0,0,0.85);
}
`

const debuggerStyle = `
.debugger {
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.side {
  align-self: stretch;
  overflow-y: auto;
  width: 260px;
  border-right: 1px solid #ccc;
  background-color: #fcfcfc;
}

.side ul {
  display: block;
  margin: 0;
  padding: 0;
  list-style-type: none;
}

.side li {
  display: block;
  background-color: #fff;
  border-bottom: 1px solid #fafafa;
  padding: 5px;
  font-family: Menlo, monospace;
  font-size: 12px;
  color: darkgray;
  cursor: default;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  width: 250px;
}

.side li:last-child {
  border-bottom: none;
}

.side li:before {
  display: inline-block;
  content: '';
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 5px;
}

.side li.active:before {
  background-color: #32ad64;
}

.main {
  flex: 1;
  align-self: stretch;
  overflow-y: auto;
}

.main section {
  padding-bottom: 10px;
}

.main section label {
  display: block;
  font-family: Menlo, Consolas, monospace;
  font-size: 12px;
  font-weight: bold;
  color: #444;
  padding: 5px 10px;
}

.main section > div {
  font-family: Menlo, Consolas, monospace;
  font-size: 12px;
  line-height: 1.6em;
  color: darkgrey;
  padding: 5px 10px;
}

.main section > div table,
.main section > div tr,
.main section > div td {
  font-size: inherit;
  font-family: inherit;
  color: inherit;
  vertical-align: top;
  border-spacing: 0;
}

.main .key-values {
  margin-left: 10px;
}

.main .key {
  padding-right: 3px;
}

.AttributedValue--string {
    color: green;
}

.AttributedValue--boolean {
    color: blue;
}

.AttributedValue--number {
    color: blue;
}

.AttributedValue--function {
    color: mediumvioletred;
}

.AttributedValue--object {
    color: black;
}

.AttributedValue--key {
    color: darkred;
}

.AttributedValue--special {
    color: magenta;
}

.AttributedDiff {
    font-family: Menlo, Consolas, monospace;
}

.AttributedDiff-pair > span + * {
    display: inline-block;
    margin-left: 10px;
}

.AttributedDiff-pair i {
    color: #ccc;
    font-style: normal;
}

.AttributedDiff--new {
    display: inline-block;
    background-color: #eaffea;
    padding: 3px;
}

.AttributedDiff--old {
    display: inline-block;
    background-color: #ffecec;
    padding: 3px;
}
`

module.exports = {embedStyle, debuggerStyle}
