/** 快照本地缓存:Files 分区文件
 * storage 在真机写入不持久,文件更可靠 */

import file from '@system.file'
import { validateSnapshot } from './snapshot'

const CACHE_URI = 'internal://files/snapshot_cache_v1.json'

export function loadCachedSnapshot(cb) {
  file.readText({
    uri: CACHE_URI,
    success: data => {
      if (!data || !data.text) {
        cb(null)
        return
      }
      try {
        cb(validateSnapshot(JSON.parse(data.text)))
      } catch (e) {
        cb(null)
      }
    },
    fail: () => cb(null),
  })
}

export function saveCachedSnapshot(snap) {
  file.writeText({
    uri: CACHE_URI,
    text: JSON.stringify(snap),
    fail: () => console.warn('[cache] save failed'),
  })
}
