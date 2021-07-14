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
  getMenuList(params) {
    return request({
        url: '/menu/list',
        method: 'get',
        data: params
    })
  },
  getPermissionList() {
    return request({
        url: '/users/getPermissionList',
        method: 'get',
        data: {},
        mock: false
    })
  },
  // 创建菜单
  menuSubmit(params) {
    return request({
        url: '/menu/operate',
        method: 'post',
        data: params
    })
  },
  // 获取角色列表
  getRoleList(params) {
    return request({
      url: '/roles/list',
      method: 'get',
      data: params,
      mock: false
    })
  },

  // 角色操作
  roleOperate(params) {
    return request({
        url: '/roles/operate',
        method: 'post',
        data: params,
        mock: false
    })
  },
  // 角色权限设置
  updatePermission(params) {
    return request({
        url: '/roles/update/permission',
        method: 'post',
        data: params,
        mock: false
    })
  },
  // 获取部门列表
  getDeptList(params) {
    return request({
      url: '/dept/list',
      method: 'get',
      mock:false,
      data: params
    })
  },
  // 部门添加删除
  deptOperate(params) {
    return request({
      url: '/dept/operate',
      method: 'post',
      data: params,
      mock: false
    })
  },
  // 获取所有用户列表
  getAllUserList() {
    return request({
      url: '/users/all/list',
      method: 'get',
      data: {}
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
    mock:false
  })
}

// 获取部门列表
export function getDeptList() {
  return request({
    url: '/dept/list',
    method: 'get'
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