/** 真机 Interconnect 接收客户端 */

import interconnect from '@system.interconnect'
import { validateSnapshot } from './snapshot'
import { saveCachedSnapshot } from './cache'

let handlers = null
let connect = null
let started = false
let lastSnap = null // 退出时补写缓存(异步写可能未完成)

// onopen 与 getReadyState 两条路径可能同时触发,做短窗口去重,避免重复上行刷新请求
const REFRESH_DEBOUNCE_MS = 2000
let lastRefreshSentAt = 0

/**
 * 连接已就绪时主动向手机端(AstroBox 插件)发一次刷新请求。
 * 快应用打开时如果没有这条上行消息,手机端无法感知应用已打开,
 * 也就不会立即回推快照。
 */
function requestSnapshot() {
  if (!connect) return
  const now = Date.now()
  if (now - lastRefreshSentAt < REFRESH_DEBOUNCE_MS) return
  lastRefreshSentAt = now
  connect.send({
    data: { type: 'refresh', sentAt: now },
  })
}

/** 连接可能已经建立(onopen 已错过),补查一次状态后按需发送刷新请求。 */
function requestSnapshotIfReady() {
  if (!connect || typeof connect.getReadyState !== 'function') return
  connect.getReadyState({
    success: data => {
      if (data && data.status === 1) requestSnapshot()
    },
  })
}

export function startSync(handlerSet) {
  handlers = handlerSet || {}
  // 再次进入页面(息屏唤醒 / onHide 后 onShow)时连接实例已存在,
  // 直接补发一次刷新请求,避免只注册一次回调而漏掉本次打开。
  if (started) {
    requestSnapshotIfReady()
    return
  }
  started = true
  try {
    connect = interconnect.instance()
  } catch (e) {
    console.warn('[ic] interconnect unavailable:', e)
    if (handlers.onUnavailable) handlers.onUnavailable()
    return
  }
  connect.onopen = () => {
    console.log('[ic] connection opened')
    if (handlers.onOpen) handlers.onOpen()
    // 连接建立后立即通知手机端:快应用已打开,请回推最新快照
    requestSnapshot()
  }
  connect.onclose = () => {
    console.warn('[ic] connection closed')
    if (handlers.onOffline) handlers.onOffline()
  }
  connect.onerror = (data, code) => {
    console.warn('[ic] error code=', code)
    if (handlers.onOffline) handlers.onOffline()
  }
  connect.onmessage = data => {
    if (!data || typeof data.data !== 'string') return
    let snap = null
    try {
      snap = validateSnapshot(JSON.parse(data.data))
    } catch (e) {
      console.warn('[ic] bad message')
      return
    }
    if (snap) {
      lastSnap = snap
      saveCachedSnapshot(snap)
      if (handlers.onSnapshot) handlers.onSnapshot(snap)
    }
  }
  // onopen 可能在本页面创建实例前已经触发过,这里补查一次连接状态
  requestSnapshotIfReady()
}

export function stopSync() {
  // 退出前补写缓存
  if (lastSnap) {
    saveCachedSnapshot(lastSnap)
    lastSnap = null
  }
  handlers = null
}
