import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/lib/theme-chalk/index.css';
import request from './utils/request'
import storage from './utils/storage'
import api from './api'
import store from './store';

const app = createApp(App)

// 按钮权限
app.directive('has', {
  beforeMount: function(el,binding) {
    let actionList = storage.getItem("actionList")
    let value = binding.value
    let hasPermission = actionList.includes(value) 
    if (!hasPermission) {
      el.style = 'display:none';
      setTimeout(() =>{
        el.parentNode.removeChild(el);
      },0)
    }
  }
})

app.config.globalProperties.$request = request
app.config.globalProperties.$storage = storage
app.config.globalProperties.$api = api

app.use(router).use(store).use(ElementPlus,{size:"small"}).mount('#app')
