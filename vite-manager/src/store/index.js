import { createStore } from 'vuex'
import mutations from './mutations'
import storage from '../utils/storage'

const state = {
  userInfo: storage.getItem('userInfo') || {}, //用户信息
  menuList: storage.getItem("menuList") || [], //菜单列表
  actionList: storage.getItem("actionList") || [], //按钮权限
  noticeCount:0,
}

export default createStore({
  state,
  mutations
})