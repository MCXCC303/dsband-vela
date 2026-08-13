/** 真机 Interconnect 接收客户端 */

import interconnect from '@system.interconnect'
import { validateSnapshot } from './snapshot'
import { saveCachedSnapshot } from './cache'

let handlers = null
let connect = null
let started = false
let lastSnap = null // 退出时补写缓存(异步写可能未完成)

export function startSync(handlerSet) {
  handlers = handlerSet || {}
  if (started) return
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
}

export function stopSync() {
  // 退出前补写缓存
  if (lastSnap) {
    saveCachedSnapshot(lastSnap)
    lastSnap = null
  }
  handlers = null
}
