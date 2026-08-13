/** 演示数据客户端 */
import { validateSnapshot } from './snapshot'

export const FORCE_MOCK = false

let handlers = null
let mockScene = 1
let timer = null
let requestedClose = true

function mockSnapshot(scene) {
  const now = Math.floor(Date.now() / 1000)
  const list = [
    {
      // 已同步
      v: 1, generatedAt: now, provider: 'deepseek', freshness: 'current',
      balance: { total: 128.47, topUp: 118, granted: 10.47, currency: 'CNY', checkedAt: now },
      cache: { date: '2026-08-11', hitRate: 0.973, hitTokens: 128400000, missTokens: 3600000 },
      models: [
        { model: 'deepseek-v4-pro', calls: 666, hitTokens: 102600000, missTokens: 2800000, outputTokens: 352900, cost: 10.41 },
        { model: 'deepseek-v4-flash', calls: 88, hitTokens: 25400000, missTokens: 800000, outputTokens: 20200, cost: 0.97 },
      ],
    },
    // 缓存
    {
      v: 1, generatedAt: now - 300, provider: 'deepseek', freshness: 'cached',
      balance: { total: 128.47, topUp: 118, granted: 10.47, currency: 'CNY', checkedAt: now - 300 },
      cache: { date: '2026-08-10', hitRate: 0.62, hitTokens: 4200000, missTokens: 2600000 },
      models: [
        { model: 'deepseek-v4-flash', calls: 120, hitTokens: 3900000, missTokens: 2300000, outputTokens: 48000, cost: 1.62 },
      ],
    },
    // 空态
    {
      v: 1, generatedAt: now, provider: 'deepseek', freshness: 'current',
      balance: null,
      cache: { date: '2026-08-11', hitRate: null, hitTokens: 0, missTokens: 0 },
      models: [],
    },
  ]
  return validateSnapshot(list[scene - 1] || list[0])
}

export function startSync(handlerSet, opts) {
  handlers = handlerSet || {}
  mockScene = (opts && opts.mockScene) || 1
  requestedClose = false
  let pushed = 0
  const push = () => {
    if (requestedClose) return
    if (handlers.onSnapshot) handlers.onSnapshot(mockSnapshot(mockScene))
    pushed++
    if (mockScene === 1) {
      timer = setTimeout(push, 15000)
    } else if (pushed < 2) {
      timer = setTimeout(push, 8000)
    }
  }
  timer = setTimeout(push, 500)
}

export function stopSync() {
  requestedClose = true
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
  handlers = null
}
