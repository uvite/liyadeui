import request from '@/utils/request'

// 查询秘钥列表
export function listPrivate(query) {
  return request({
    url: '/app/private/list',
    method: 'get',
    params: query
  })
}

// 查询秘钥详细
export function getPrivate(privateId) {
  return request({
    url: '/app/private/' + privateId,
    method: 'get'
  })
}

// 新增秘钥
export function addPrivate(data) {
  return request({
    url: '/app/private',
    method: 'post',
    data: data
  })
}

// 修改秘钥
export function updatePrivate(data) {
  return request({
    url: '/app/private',
    method: 'put',
    data: data
  })
}

// 删除秘钥
export function delPrivate(privateId) {
  return request({
    url: '/app/private/' + privateId,
    method: 'delete'
  })
}
