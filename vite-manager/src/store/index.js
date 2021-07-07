import { createStore } from 'vuex'
import mutaions from './mutaions'
import storage from '../utils/storage'

const state = {
  userInfo: "" || storage.getIten('userInfo')
}

export default createStore({
  state,
  mutaions
})