/** 模拟器 HTTP 快照拉取客户端 */

import fetch from '@system.fetch'
import { validateSnapshot } from './snapshot'

const POLL_INTERVAL = 60000

let handlers = null
let url = ''
let timer = null
let requestedClose = true

export function startSync(handlerSet, opts) {
  handlers = handlerSet || {}
  url = (opts && opts.url) || ''
  requestedClose = false
  if (!url) {
    if (handlers.onUnavailable) handlers.onUnavailable()
    return
  }
  poll()
}

function poll() {
  if (requestedClose || !url) return
  // 默认 text 手动解析
  fetch.fetch({
    url,
    success: res => {
      if (requestedClose) return
      let data = res && res.data
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data)
        } catch (e) {
          data = null
        }
      }
      const snap = res && res.code === 200 && data ? validateSnapshot(data) : null
      if (snap) {
        if (handlers.onSnapshot) handlers.onSnapshot(snap)
      } else {
        console.warn('[http] snapshot rejected, code=', res && res.code)
        if (handlers.onOffline) handlers.onOffline()
      }
      schedule()
    },
    fail: () => {
      if (requestedClose) return
      console.warn('[http] fetch failed')
      if (handlers.onOffline) handlers.onOffline()
      schedule()
    },
  })
}

function schedule() {
  if (requestedClose) return
  timer = setTimeout(poll, POLL_INTERVAL)
}

export function stopSync() {
  requestedClose = true
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
  handlers = null
}
