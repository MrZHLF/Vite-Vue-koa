import { createStore } from 'vuex'
import mutations from './mutations'
import storage from '../utils/storage'

const state = {
  userInfo: "" || storage.getIten('userInfo')
}

export default createStore({
  state,
  mutations
})