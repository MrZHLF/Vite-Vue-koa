import config from './../config'

/**
 * storage 二次封装
*/
export default {
  setItem(key,val) {
    let storage = this.getStroage()
    storage[key] = val;
    window.localStorage.setItem(config.namespace,JSON.stringify(storage))
  },
  getIten(key) {
    return this.getStroage()[key]
  },
  getStroage(key) {
    return JSON.parse(window.localStorage.getItem(config.namespace) || "{}")
  },
  clearItem(key) {
    let storage = this.getStroage()
    delete storage[key]
    window.localStorage.setItem(config.namespace,JSON.stringify(storage))
  },
  clearAll() {
    window.localStorage.clear()
  }
}