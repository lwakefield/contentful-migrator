export default function argparse (args = process.argv.slice(2)) {
    const isLongOpt = v => v && v.startsWith('--')
    const isShortOpt = v => v && v.startsWith('-')
    const isOpt = v => v && isLongOpt(v) || isShortOpt(v)
    const getOptName = v => v && (v.match(/^--?(\w+)/) || [])[1]
    const getOptVal = v => v && (v.match(/^--?\w+=?(.+)?/) || [])[1] || true

    const result = {}
    while (args.length) {
        const arg = args.shift()
        const peek = args[0]

        if (isOpt(arg)) {
            result[getOptName(arg)] = peek && !isOpt(peek)
                ? peek
                : getOptVal(arg)
            if (!isOpt(peek)) args.shift()
        } else {
            result._ = (result._ || []).concat(arg)
        }
    }

    return result
}


