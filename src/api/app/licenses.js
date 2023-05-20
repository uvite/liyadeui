import request from '@/utils/request'

// 查询授权管理列表
export function listLicenses(query) {
  return request({
    url: '/app/licenses/list',
    method: 'get',
    params: query
  })
}

// 查询授权管理详细
export function getLicenses(licenseId) {
  return request({
    url: '/app/licenses/' + licenseId,
    method: 'get'
  })
}

// 新增授权管理
export function addLicenses(data) {
  return request({
    url: '/app/licenses',
    method: 'post',
    data: data
  })
}

// 修改授权管理
export function updateLicenses(data) {
  return request({
    url: '/app/licenses',
    method: 'put',
    data: data
  })
}

// 删除授权管理
export function delLicenses(licenseId) {
  return request({
    url: '/app/licenses/' + licenseId,
    method: 'delete'
  })
}
