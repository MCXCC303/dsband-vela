/** 同步配置解析:从 $def.data(app.ux)/$data(manifest)读取演示开关、传输通道与快照端点。 */

import { FORCE_MOCK } from './mock-client'

const DEFAULT_SNAPSHOT_URL = 'http://10.0.2.2:17323/snapshot' // QEMU 模拟器宿主网关

export function resolveSyncConfig($app) {
  const defData = $app && $app.$def && $app.$def.data ? $app.$def.data : {}
  const appData = $app && $app.$data ? $app.$data : {}
  return {
    mock: !!(defData.mock || appData.mock || FORCE_MOCK),
    mockScene: defData.mockScene || appData.mockScene || 1,
    snapshotUrl: defData.snapshotUrl || appData.snapshotUrl || DEFAULT_SNAPSHOT_URL,
    transport: defData.transport || appData.transport || 'auto',
  }
}
