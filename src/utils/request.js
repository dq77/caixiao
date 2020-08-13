/*
 * @Author: 刁琪
 * @Date: 2020-08-13 13:56:39
 * @LastEditors: わからないよう
 */
import Taro from '@tarojs/taro'
import { channelAccredit } from '../utils/accredit'
import { baseUrl } from '../config'

export default (options = { method: 'GET', data: {}, requestType: false, contentType: '' }) => {
  let Token
  if (Taro.getStorageSync('Token')) {
    Token = Taro.getStorageSync('Token')
  }
  return new Promise((resolve, reject) => {
    Taro.request({
      url: baseUrl + options.url,
      data: options.data,
      header: {
        'Content-Type': options.contentType || 'application/json',
        Authorization: Token ? Token : '' // 请求携带token
      },
      contentType: false,
      method: options.method.toUpperCase()
    }).then(res => {
      const { statusCode, data } = res
      if (statusCode >= 200 && statusCode < 300) {
        if ((data.code === -1 || data.code > 200) && data.code !== 20021) {
          Taro.showToast({
            title: `${res.data.subMsg}` || res.data.code,
            icon: 'none',
            mask: true
          })
        }
        // -110 token 失效登陆授权页
        if (data.code === -110) {
          channelAccredit()
        }
        resolve(data)
      } else {
        reject(data)
        throw new Error(`网络请求错误，状态码${statusCode}`)
      }
    })
  })

  // return
}
