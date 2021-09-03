import axios from 'axios'
import qs from 'qs'
import { Toast } from 'vant'
import { createStorage } from 'utils/storage'
import { cloneDeep, startsWith } from 'lodash'
import { checkStatus } from './checkStatus'
import { ResultEnum, RequestTypeEnum, ContentTypeEnum } from './httpEnum'

const AuthToken = 'Auth_Token'

// 环境变量
const isDev = process.env.NODE_ENV === 'development'
const Storage = createStorage({ storage: localStorage })
const handleError = err => {
  const _code = err.code ? parseInt(err.code) : 500
  // 开发环境打印错误信息
  if (isDev) {
    console.error(`===status:${ _code };===errorMessageText:${ err.message }`)
  }
  checkStatus(_code, err.message)
}

class VAxios {
  constructor (options) {
    this.options = options
    this.instance = null
  }

  /**
   * axios的请求主体
   * @param configs
   * @param options
   */
  request (configs, options) {
    console.log(qs)
    this.instance = axios.create()
    // 默认配置
    let contentType = ContentTypeEnum.JSON
    if (options && options.contentType) {
      contentType = options.contentType
      const { isForm } = options
      if(isForm) configs.data = qs.stringify(configs.data)
      // console.log(configs.data)
    }
    this.instance.defaults.headers['Content-Type'] = contentType
    this.instance.defaults.method = RequestTypeEnum.GET
    const _conf = cloneDeep(configs)
    const _opts = Object.assign({}, this.options, options)
    // 格式化接口地址
    _conf.url = startsWith(_conf.url, 'http') ? _conf.url : `${ location.origin }/${ _conf.url }`
    const {
      isShowErrorMessage,
      errorMessageText,
      isTransformRequestResult,
      isShowServerErrorMessage,
      isTimeout,
      timeoutNumber,
      ignoreToken,
      isHandleData,
    } = _opts
    // 是否需要设置超时时长
    if (isTimeout) {
      this.instance.defaults.timeout = timeoutNumber
    }
    // request拦截器
    this.instance.interceptors.request.use(config => {
      const { headers } = config
      // 是否忽略 token 校验
      if (!ignoreToken) {
        headers.Authorization = Storage.getCookie(AuthToken) || 'Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIxODI2MDA3NjQyMSIsImNyZWF0ZWQiOjE2MzAzNzU0NDcxMDUsImV4cCI6MTYzMDk4MDI0N30.wrlZOSmUTmUrQ9u34n4yhOTx9V0seg5mCr9HB1HqzQ5MBKLmVkC9NO9eB3e2ddqeJJH4QXoHwwm8T5-Ii5kQJg'
        headers.token = Storage.getCookie('satoken')
      }
      return config
    }, undefined)
    // response拦截器
    this.instance.interceptors.response.use(res => {
      const {
        data,
        config,
      } = res
      if ((typeof data !== 'object') || (!('code' in data)) || !isHandleData) {
        return Promise.resolve(data)
      }
      if ((data.code === ResultEnum.SUCCESS) || (data.code === ResultEnum.KnowledgeSuccess)) {
        // 是否需要格式化接口出参
        if (isTransformRequestResult) {
          return Promise.resolve(data.data)
        } else {
          return Promise.resolve(data)
        }
      } else {
        // 是否统一处理业务异常
        if (isShowServerErrorMessage) {
          handleError({
            name: '',
            message: errorMessageText || data.data || data.message,
            code: data.code.toString(),
            config: config,
            response: res,
            isAxiosError: false,
            toJSON: () => {
              return {}
            },
          })
        }
        return Promise.reject(res)
      }
    }, err => {
      // 是否统一处理http接口请求异常
      if (isShowErrorMessage) {
        handleError({
          ...err,
          message: errorMessageText || err.response.statusText,
          code: err.response?.status.toString(),
        })
      }
      return Promise.reject(err.response)
    })
    // console.log('_conf:', _conf)
    // 接口请求
    return this.instance.request(_conf)
  }
}

/**
 * 请求类接口实现
 */
const Http = new VAxios({
  formatDate: false,
  joinParamsToUrl: false,
  isTransformRequestResult: true,
  isParseToJson: true,
  isShowErrorMessage: true,
  errorMessageText: '',
  isShowServerErrorMessage: true,
  serverErrorMessage: '',
  isTimeout: true,
  timeoutNumber: 60000,
  ignoreToken: false,
  isHandleData: true,
})
export default Http
