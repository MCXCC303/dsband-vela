/** 余额/今日消费动态字号 */

const MAX_WIDTH = 165
const SIZES = [64, 60, 56, 52, 48, 44, 40, 36, 32, 28]

export function balanceFontClass(total, maxSize) {
  if (typeof maxSize !== 'number') maxSize = 64
  const text = '¥' + Number(total).toFixed(2)
  let w = 0
  for (let i = 0; i < text.length; i++) {
    const ch = text.charAt(i)
    if (ch === '¥') w += 0.5
    else if (ch === '.') w += 0.34
    else w += 0.62
  }
  const size = Math.floor(MAX_WIDTH / w)
  for (let i = 0; i < SIZES.length; i++) {
    if (size >= SIZES[i] && SIZES[i] <= maxSize) {
      return 'balance-f' + SIZES[i]
    }
  }
  return 'balance-f28'
}
