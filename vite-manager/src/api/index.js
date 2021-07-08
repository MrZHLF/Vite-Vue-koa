/**
 * api管理
 */
import request from './../utils/request'

export default {
  login(params) {
    return request({
        url: '/users/login',
        method: 'post',
        data: params
    })
  },
  noticeCount() {
    return request({
      url: '/leave/count',
      method: 'get',
      data: {},
      mock:true
    })
  },
  getMenuList() {
    return request({
        url: '/menu/list',
        method: 'get',
        data: {},
        mock:true
    })
  },
}

// 获取用户列表
export function getUserList(params) {
  return request({
      url: `/users/list?state=${params.state}&pageNum=${params.pageNum}&pageSize=${params.pageSize}`,
      method: 'get'
  })
}

// 用户删除
export function userDel(params) {
  return request({
      url: '/users/delete',
      method: 'post',
      data: params
  })
}

// 获取用户角色列表
export function getRoleAllList() {
  return request({
    url: '/roles/allList',
    method: 'get',
    mock:true,
    data: {}
  })
}

// 获取部门列表
export function getDeptList() {
  return request({
    url: '/dept/list',
    method: 'get',
    mock:true
  })
}

// 创建用户信息
export function userSubmit(params) {
  return request({
    url: '/users/operate',
    method: 'post',
    data: params
  })
}