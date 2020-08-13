import Taro from '@tarojs/taro'
import Request from './request'
import getChannel from './channel'


// 不同渠道走不同的授权流程
export function channelAccredit() {
  return new Promise((resolve) => {
    appMiniCheckSession().then(() => {
      resolve(false)
    })
  })
}

//获取url?后面参数
export function GetRequest(name) {
  let reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)')
  let r = window.location.search.substr(1).match(reg) //search,查询？后面的参数，并匹配正则
  if (r != null) return unescape(r[2])
  return null
}

export function applicationAccredit() {
  // 不同页面走不同的授权操作
  switch (getChannel()) {
    case 'WeChat':
      appMiniLogin();
      return;
    default:
      break
  }
}
// 授权  手机号绑定流程处理
export function hasUserState() {
  // if(getChannel() === 'WeChat') return true
  // 第一步 判断cookie是拥有openid accessToken  无 ====> 前往权益授权  有=======> 判断cookie 是否拥有Token
  return new Promise((resolve, reject) => {
    if (!Taro.getStorageSync('openid')) {
      Taro.setStorageSync('loginStatus', false)
      Taro.showLoading({
        title: '登录中'
      })
      channelAccredit().then((res) => {
        reject(res);
      })
      // return false
    } else {
      console.log('微信小程序授权判断');
      if (!Taro.getStorageSync('Token') && Taro.getStorageSync('openid')) {
        Taro.navigateTo({
          url: '/pages/user/bindUserMobileLogin/index'
        })
        // resolve(false);
      } else {
        resolve(true)
      }
    }
  })
}



// <==========================我是可爱的分割线😊==================================>
/**
 * 微信小程序授权流程
 * 1 调用小程序登陆 api  Taro.login  获取登陆凭证 code()
 * 2 调用小程序 Taro.checkSession  检验登陆接口的的时效性  具体时间由微信端实现判断 失效 ==> 重新登陆
 * 3 通过凭证调用服务端后台接口 换取 openid  token
 * 4 兼容处理用户拒绝授权的情况

 */

// 微信小程序检验登陆状态
export function appMiniCheckSession() {
  return new Promise((resolve) => {
    if (Taro.getStorageSync('opendid')) {
      Taro.checkSession().then(
        () => {
          // 授权状态在线 ===> 无需重复登陆
          resolve(Taro.getStorageSync('openid'))
          console.log('登录有效')
        },
        () => {
          // 授权状态失效 ===> 前往登陆
          appMiniLogin().then(
            (res)=> {
              console.log('获取openid成功', res);
              resolve(res);
            }
          )
        }
      )
    } else {
      appMiniLogin().then((res) => {
        console.log('获取openid成功');
          resolve(res);
      });
    }
  })
}

// 微信小程序登陆
export function appMiniLogin() {
  return new Promise((resolve) => {
    Taro.login().then(
      (res) => {
        console.log('微信小程序code', res);
        res.code && getAppMiniOpeId(res.code).then(
          (res2) => {
            resolve(res2)
          }
        );
      },
      () => {
        console.log('获取失败！');
      }
    )
    }
  )
}

// 跟服务端换取openid
export function getAppMiniOpeId(code) {
  return new Promise((resolve) => {
    Request({
      url: '/user/wechat/UserLogin',
      method: 'GET',
      data: { authCode: code } }).then(res => {
      if (res.code === 200) {
        Taro.hideLoading();
        if (res.data.token) {
          Taro.setStorageSync('Token', res.data.token)
        }
        // openid
        if (res.data && res.data.openid) {
          Taro.setStorageSync('openid', res.data.openid)
        } else if (res.data.wxUserResponse && res.data.wxUserResponse.openid) {
          Taro.setStorageSync('openid', res.data.wxUserResponse.openid)
        }
        resolve(Taro.getStorageSync('openid'));
        console.log('获取openid回调', res);
      }
    })
  })
}

export function appMiniGetSetting() {
  Taro.getSetting().then(
    res => {
      console.log(res, '用户成功授权')
    },
    res => {
      console.log(res, '用户拒绝了授权')
    }
  )
}
