/** 屏幕常亮:进入开启,退出关闭
 * 仅 setKeepScreenOn;设置亮度值有概率触发真机卡死 */

import brightness from '@system.brightness'

const available = brightness && typeof brightness.setKeepScreenOn === 'function'

export function brighten() {
  if (!available) return
  brightness.setKeepScreenOn({ keepScreenOn: true })
}

export function restore() {
  if (!available) return
  brightness.setKeepScreenOn({ keepScreenOn: false })
}
