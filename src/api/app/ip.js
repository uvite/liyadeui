import request from '@/utils/request'

// 查询ip白名单列表
export function listIp(query) {
  return request({
    url: '/app/ip/list',
    method: 'get',
    params: query
  })
}

// 查询ip白名单详细
export function getIp(id) {
  return request({
    url: '/app/ip/' + id,
    method: 'get'
  })
}

// 新增ip白名单
export function addIp(data) {
  return request({
    url: '/app/ip',
    method: 'post',
    data: data
  })
}

// 修改ip白名单
export function updateIp(data) {
  return request({
    url: '/app/ip',
    method: 'put',
    data: data
  })
}

// 删除ip白名单
export function delIp(id) {
  return request({
    url: '/app/ip/' + id,
    method: 'delete'
  })
}
