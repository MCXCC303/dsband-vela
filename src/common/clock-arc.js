/** 弧形时钟 */

const CLOCK_ARC = { cx: 106, cy: 102, r: 92 }
const CHAR_W = 14
const CHAR_H = 22
const CHAR_STEP = 10 // 相邻字符角度间隔(度)

// 旋转用静态 CSS 类(Vela 动态 style 不支持 transform)
const ROT_CLASSES = ['rot-neg20', 'rot-neg10', 'rot-0', 'rot-pos10', 'rot-pos20']
const ROT_STEP = 10

export function arcClockChars(text) {
  const n = text.length
  // 字符中心半径 = 弧半径 - 半高,使旋转后字符上边中心落在圆弧上
  const r = CLOCK_ARC.r - CHAR_H / 2
  const chars = []
  for (let i = 0; i < n; i++) {
    const deg = (i - (n - 1) / 2) * CHAR_STEP
    const rad = (deg * Math.PI) / 180
    const idx = Math.round(deg / ROT_STEP) + 2
    chars.push({
      ch: text.charAt(i),
      x: Math.round(CLOCK_ARC.cx + r * Math.sin(rad) - CHAR_W / 2),
      y: Math.round(CLOCK_ARC.cy - r * Math.cos(rad) - CHAR_H / 2),
      rotClass: ROT_CLASSES[Math.max(0, Math.min(idx, ROT_CLASSES.length - 1))],
    })
  }
  return chars
}
