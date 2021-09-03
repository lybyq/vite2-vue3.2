/**
 * 前端数据采集和上报
 */
import { ProjectConfigInfo as config } from '@/config/projectInfo'
import store from '@/store'
import { cloneDeep } from 'lodash'
import Moment from 'moment'
import router from '@/router'

class Log {
  constructor (params) {
    this.defaultParams = params
  }
  /**
    * 日志上报-事件
    * @param params 日志实例化对象
    */
  saveLog (params) {
    try {
      const _params = Object.assign({}, this.defaultParams, cloneDeep(params))
      // 拼接参数串
      let args = ''
      for (const [key, value] of Object.entries(_params)) {
        if (args !== '') {
          args += '&'
        }
        args += key + '=' + encodeURIComponent(value || '')
      }
      const img = new Image(1, 1)
      img.src = `自定义.gif?${args}`
      // 3000ms超时处理
      setTimeout(() => {
        if (img && (!img.complete || !img.naturalWidth)) {
          img.src = null
        }
      }, 3000)
    } catch (e) {
    }
  }

  /**
    * 事件埋点
    * @param eventParams
    */
  eventLog (eventParams) {
    // 页面参数
    const {
      fullPath,
      meta,
    } = router.currentRoute.value
    // 事件点击参数
    const {
      eventName,
      eventCode,
      activeCode,
    } = eventParams
    const _params = {
      activeCode: activeCode,
      enterTime: Moment(new Date()).valueOf().toString(),
      event: eventName,
      eventCode: eventCode,
      page: fullPath,
      pageCode: meta.code || '0',
    }
    // 路由参数
    this.saveLog(_params)
  }

  /**
    * 离开路由埋点
    * @param params
    */
  leaveRouteLog (params) {
    // 页面参数
    const {
      page,
      pageCode,
    } = params
    const _params = {
      event: '离开页面',
      eventCode: '-1',
      page,
      pageCode: pageCode,
    }
    this.saveLog(_params)
  }

  /**
    * 进入页面埋点
    */
  enterRouteLog () {
    // 页面参数
    const {
      fullPath,
      meta,
    } = router.currentRoute.value
    const _params = {
      event: '进入页面',
      eventCode: '0',
      // eslint-disable-next-line vue/sort-keys
      enterTime: Moment(new Date()).valueOf().toString(),
      page: fullPath,
      pageCode: meta.code ? meta.code : '0',
    }
    this.saveLog(_params)
  }
  /**
    * 接口请求埋点
    * @param requestParams
    */
  apiRequestLog (requestParams) {
    console.log('requestParams:', requestParams)
  }
}

const _getters = store.getters
const _env = process.env.NODE_ENV
const dataLog = new Log({
  uId: _getters['auth/id'],
  project: config.name,
  version: config.version,
  phone: _getters['auth/phone'],
  sourceCode: _getters['auth/info'].sourceCode,
  channelCode: _getters['auth/info'].channelCode,
  environment: _env,
  time: Moment(new Date()).valueOf().toString(),
  ua: navigator.userAgent,
})

export default dataLog

