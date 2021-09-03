import axios from 'axios'
import { Toast } from 'vant'
// import Cookie from 'js-cookie'

axios.defaults.headers['Content-Type'] = 'application/json;charset=utf-8'
const BASE_URL = ''
class HttpRequest {
  constructor(outOptions = { ignoreToken: false }) {
    this.outOptions = outOptions
  }

  interceptors(instance) {
    instance.interceptors.request.use(config => {
      const { ignoreToken } = this.outOptions
      // if(!ignoreToken) instance.defaults.headers.Authorization = ''
      return config
    }, error => {
      Promise.reject(error)
    })

    instance.interceptors.response.use(
      async res => {
        // 未设置状态码则默认成功状态
        const status = res.data.status || ''
        // fail 判断 接口是否 错误
        if (status === 'fail') {
          const code = res.data.code
          // 获取错误信息
          const msg = res.data.msg || res.data.message
          if (code === 401) {
            // xxxxxx
            return
          } else {
            Toast({
              message: msg,
              position: 'top',
              type: 'fail',
            })
            return Promise.reject(msg)
          }
        }
        // 没有报错的时候返回res 的 data 值
        return res.data
      },
      async error => {
        console.log(error)
        let { message } = error
        const response = error.response
        if (response && response.status && response.status === 401) {
          // 做重定向
          return
        }
        if (message == 'Network Error') {
          message = '网络异常' //后端接口连接异常
        } else if (message.includes('timeout')) {
          message = '系统接口请求超时'
        } else if (message.includes(' failed with status code')) {
          message = '系统接口' + message.substr(message.length - 3) + '异常'
        }
        Toast({
          message: message,
          position: 'top',
          type: 'fail',
        })
        return Promise.reject(error)
      },
    )
  }

  configureInitParams() {
    const config = {
      baseURL: BASE_URL,
      timeout: 10000,
    }

    return config
  }

  request(configs, options) {
    const instance = axios.create()
    this.outOptions = Object.assign(this.outOptions, options)
    configs = Object.assign(this.configureInitParams(), configs)
    this.interceptors(instance)
    return instance(configs, options)
  }
}

export default HttpRequest
