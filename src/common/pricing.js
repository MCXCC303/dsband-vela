/**
 * 峰谷定价规则(北京时间)。
 *
 * DeepSeek API 自北京时间 2026-08-17 00:00 起采用峰谷定价:
 * - 高峰时段:9:00 - 12:00、14:00 - 18:00(含起点,不含终点)
 * - 其余为空闲时段,价格约为高峰时段的一半
 *
 * 本模块用于在高峰时段把时钟文本染成橘红色,提示用户当前处于高峰计费时段。
 */

// 新价格生效时间:北京时间 2026-08-17 00:00(UTC+8 → UTC 存储)
const BEIJING_OFFSET_MS = 8 * 3600 * 1000
export const PRICING_START = Date.UTC(2026, 7, 17, 0, 0, 0) - BEIJING_OFFSET_MS

// 高峰时段(小时,半开区间 [start, end))
export const PEAK_WINDOWS = [
  { start: 9, end: 12 },
  { start: 14, end: 18 },
]

// 时钟文本配色:高峰橘红 / 空闲白
export const CLOCK_PEAK_COLOR = '#ff6b4a'
export const CLOCK_NORMAL_COLOR = '#ffffff'

/** 北京时间小时(与设备时区无关,统一按 UTC+8 换算) */
export function beijingHour(date) {
  return new Date(date.getTime() + BEIJING_OFFSET_MS).getUTCHours()
}

/** 是否处于高峰计费时段(北京时间,且新价格已生效) */
export function isPeakWindow(date) {
  if (!(date instanceof Date)) date = new Date(date)
  if (date.getTime() < PRICING_START) return false
  const hour = beijingHour(date)
  for (const w of PEAK_WINDOWS) {
    if (hour >= w.start && hour < w.end) return true
  }
  return false
}
