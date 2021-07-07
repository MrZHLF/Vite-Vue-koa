/**
 * axios 封装
*/
import axios from 'axios'
import config from './../config'
import { ElMessage } from 'element-plus'
import router from '../router'

const TOKEN_INVAID = 'Token认证失败，请重新登录'
const NETWORK_ERROR = '网络请求异常,请重新重试'

const service = axios.create({
  baseURL:config.baseApi,
  timeout: 8000
})

// 请求拦截
service.interceptors.request.use((req) => {
  const headers = req.headers
  if (!headers.Authorization) headers.Authorization = 'Bear jack'
  return req
})

// 响应拦截
service.interceptors.response.use(res => {
  const { data, msg} = res
  if (data.code === 200) {
    return data.data
  } else if (data.code === 40001) {
    ElMessage.error(TOKEN_INVAID)
    setTimeout(() =>{
      router.push('/login')
    },1500)
    return Promise.reject(TOKEN_INVAID)
  } else {
    ElMessage.error(msg || NETWORK_ERROR)
    return Promise.reject(msg || NETWORK_ERROR)
  }
})

function request(options) {
  options.method = options.method || 'get'
  if (options.method.toLowerCase() === 'get') {
      options.params = options.data;
  }
  if (typeof options.mock != 'undefined') {
      config.mock = options.mock
  }
  if (config.env === 'prod') {
      service.defaults.baseURL = config.baseApi
  } else {
      service.defaults.baseURL = config.mock ? config.mockApi  : config.baseApi
  }

  return service(options)
}

['get', 'post', 'put', 'delete', 'patch'].forEach((item) => {
  request[item] = (url, data, options) => {
      return request({
          url,
          data,
          method: item,
          ...options
      })
  }
})

export default request