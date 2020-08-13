/*
 * @Author: 刁琪
 * @Date: 2020-08-13 13:52:53
 * @LastEditors: わからないよう
 */
import { create } from 'dva-core'
import Taro from '@tarojs/taro'

let app
let store
let dispatch

function createApp(opt) {
  // redux日志
  // opt.onAction = [createLogger()];
  app = create(opt)
  // 适配支付宝小程序
  if (Taro.getEnv() === Taro.ENV_TYPE.ALIPAY) {
    global = {}
  }
  if (!global.registered) opt.models.forEach(model => app.model(model))
  global.registered = true
  app.start()

  store = app._store
  app.getStore = () => store

  dispatch = store.dispatch

  app.dispatch = dispatch
  return app
}

export default {
  createApp,
  getDispatch() {
    return app.dispatch
  }
}
