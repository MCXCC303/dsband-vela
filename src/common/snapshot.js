/**
 * 快照协议层:provider-usage-snapshot-v1 校验与格式化。
 */

export const SNAPSHOT_VERSION = 1

export const HIT_RATE_LOW = 0.7
export const HIT_RATE_MID = 0.95
// Flash 命中率阈值更低(缓存复用率天然更高)
export const FLASH_HIT_RATE_LOW = 0.5
export const FLASH_HIT_RATE_MID = 0.7
export const COLOR_GRAY = '#8a8a8a'

// Pro 命中率环配色(深色系;色名取自 Vela 颜色配置文档 components/general/color.md)
export const PRO_HIT_COLORS = {
  red: '#dc143c',    // crimson
  yellow: '#daa520', // goldenrod
  green: '#2e8b57',  // seagreen
}

// Flash 命中率环配色(浅色系)
export const FLASH_HIT_COLORS = {
  red: '#f08080',    // lightcoral
  yellow: '#f0e68c', // khaki
  green: '#90ee90',  // lightgreen
}

/** 校验快照:v 不匹配整帧拒绝 */
export function validateSnapshot(obj) {
  if (!obj || typeof obj !== 'object') return null
  if (obj.v !== SNAPSHOT_VERSION) return null
  if (typeof obj.generatedAt !== 'number') return null
  if (obj.freshness !== 'current' && obj.freshness !== 'cached' && obj.freshness !== 'unavailable') return null
  return {
    v: obj.v,
    generatedAt: obj.generatedAt,
    provider: obj.provider || '',
    freshness: obj.freshness,
    balance: obj.balance && typeof obj.balance === 'object' ? obj.balance : null,
    cache: obj.cache && typeof obj.cache === 'object' ? obj.cache : null,
    models: Array.isArray(obj.models) ? obj.models : [],
  }
}

/** token 千分位格式 */
export function formatTokensPlain(n) {
  if (typeof n !== 'number' || !isFinite(n)) return '--'
  return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

/** token 自然单位格式(K/M/B,一位小数,用于占比条两端的小字) */
export function formatTokensCompact(n) {
  if (typeof n !== 'number' || !isFinite(n) || n < 0) return '--'
  if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B'
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M'
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K'
  return String(Math.round(n))
}

export function formatMoney(n) {
  if (typeof n !== 'number' || !isFinite(n)) return '¥0.00'
  return '¥' + n.toFixed(2)
}

export function formatHitRate(rate) {
  if (typeof rate !== 'number' || !isFinite(rate)) return null
  return (rate * 100).toFixed(1) + '%'
}

export function hitRateColor(rate, low = HIT_RATE_LOW, mid = HIT_RATE_MID, colors = PRO_HIT_COLORS) {
  if (typeof rate !== 'number' || !isFinite(rate)) return COLOR_GRAY
  if (rate < low) return colors.red
  if (rate < mid) return colors.yellow
  return colors.green
}

export function minutesAgo(unixSec) {
  if (typeof unixSec !== 'number' || !isFinite(unixSec)) return null
  const diff = Math.floor(Date.now() / 1000) - unixSec
  return diff > 0 ? Math.floor(diff / 60) : 0
}

/** 缓存日期标签:MM/DD(分钟数超过 99 时替代分钟文案,防止胶囊超宽) */
export function formatCacheDate(unixSec) {
  if (typeof unixSec !== 'number' || !isFinite(unixSec)) return '--/--'
  const d = new Date(unixSec * 1000)
  if (isNaN(d.getTime())) return '--/--'
  return (d.getMonth() + 1) + '/' + d.getDate()
}

export function formatClockHM(now) {
  const pad = n => (n < 10 ? '0' + n : String(n))
  return pad(now.getHours()) + ':' + pad(now.getMinutes())
}

function num(v) {
  return typeof v === 'number' && isFinite(v) ? v : 0
}

function hitRate(hit, miss) {
  const total = hit + miss
  return total > 0 ? hit / total : null
}

/** 模型 ID → 归一化种类(仅识别 flash / pro) */
function modelKind(model) {
  if (typeof model !== 'string') return 'other'
  const m = model.toLowerCase()
  if (m.endsWith('-flash') || m === 'flash') return 'flash'
  if (m.endsWith('-pro') || m === 'pro') return 'pro'
  return 'other'
}

/**
 * 把 models 数组拆成 Pro / Flash 两个聚合条目(未识别模型忽略)。
 * 每条含 calls / hitTokens / missTokens / outputTokens / cost,
 * 以及派生的 hitRate。
 */
export function splitModels(models) {
  const zero = { calls: 0, hitTokens: 0, missTokens: 0, outputTokens: 0, cost: 0 }
  const pro = { ...zero }
  const flash = { ...zero }
  if (Array.isArray(models)) {
    for (const m of models) {
      if (!m || typeof m !== 'object') continue
      const kind = modelKind(m.model)
      const bucket = kind === 'flash' ? flash : kind === 'pro' ? pro : null
      if (!bucket) continue
      bucket.calls += num(m.calls)
      bucket.hitTokens += num(m.hitTokens)
      bucket.missTokens += num(m.missTokens)
      bucket.outputTokens += num(m.outputTokens)
      bucket.cost += num(m.cost)
    }
  }
  return {
    pro: { ...pro, hitRate: hitRate(pro.hitTokens, pro.missTokens) },
    flash: { ...flash, hitRate: hitRate(flash.hitTokens, flash.missTokens) },
  }
}
