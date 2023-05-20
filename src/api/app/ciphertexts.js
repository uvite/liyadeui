import request from '@/utils/request'

// 查询密文管理列表
export function listCiphertexts(query) {
  return request({
    url: '/app/ciphertexts/list',
    method: 'get',
    params: query
  })
}

// 查询密文管理详细
export function getCiphertexts(id) {
  return request({
    url: '/app/ciphertexts/' + id,
    method: 'get'
  })
}

// 新增密文管理
export function addCiphertexts(data) {
  return request({
    url: '/app/ciphertexts',
    method: 'post',
    data: data
  })
}

// 修改密文管理
export function updateCiphertexts(data) {
  return request({
    url: '/app/ciphertexts',
    method: 'put',
    data: data
  })
}

// 删除密文管理
export function delCiphertexts(id) {
  return request({
    url: '/app/ciphertexts/' + id,
    method: 'delete'
  })
}
