import stringWidth from 'string-width'
import figures from 'figures'
import BasicReporter from './basic'
import { parseStack } from '../utils/error'
import { chalkColor, chalkBgColor } from '../utils/chalk'
import { TYPE_COLOR_MAP, LEVEL_COLOR_MAP } from '../utils/fancy'

const DEFAULTS = {
  secondaryColor: 'grey',
  formatOptions: {
    colors: true,
    compact: false
  }
}

const TYPE_ICONS = {
  info: figures('ℹ'),
  success: figures('✔'),
  debug: figures('›'),
  trace: figures('›'),
  log: ''
}

export default class FancyReporter extends BasicReporter {
  constructor (options) {
    super(Object.assign({}, DEFAULTS, options))
  }

  formatStack (stack) {
    const color1 = chalkColor('grey')
    const color2 = chalkColor('cyan')
    const color3 = chalkColor('reset')

    return '\n' + parseStack(stack)
      .map(line => color2('  ' + line
        .replace(/^at /, m => color1(m))
        .replace(/\(.*\)/, (m) => color3(m))
      ))
      .join('\n')
  }

  typeColor (type, level) {
    return chalkColor()
  }

  formatType (logObj, isBadge) {
    const typeColor = TYPE_COLOR_MAP[logObj.type] ||
      LEVEL_COLOR_MAP[logObj.level] ||
      this.options.secondaryColor

    if (isBadge) {
      return chalkBgColor(typeColor).black(` ${logObj.type.toUpperCase()} `)
    }

    const _type = typeof TYPE_ICONS[logObj.type] === 'string' ? TYPE_ICONS[logObj.type] : (logObj.icon || logObj.type)
    return _type ? chalkColor(typeColor)(_type) : ''
  }

  formatLogObj (logObj, { width }) {
    const [ message, ...additional ] = this.formatArgs(logObj.args).split('\n')

    const isBadge = typeof logObj.badge !== 'undefined' ? Boolean(logObj.badge) : logObj.level < 2

    const secondaryColor = chalkColor(this.options.secondaryColor)

    const date = secondaryColor(this.formatDate(logObj.date))

    const type = this.formatType(logObj, isBadge)

    const tag = logObj.tag ? secondaryColor(logObj.tag) : ''

    let left = this.filterAndJoin([type, message])
    let right = this.filterAndJoin([tag, date])

    const space = width - stringWidth(left) - stringWidth(right) - 2

    let line = space > 0 ? (left + ' '.repeat(space) + right) : left

    line += additional.length
      ? '\n' + additional.join('\n')
      : ''

    return isBadge ? '\n' + line + '\n' : line
  }
}
