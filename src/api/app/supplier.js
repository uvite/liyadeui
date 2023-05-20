import request from '@/utils/request'

// 查询供应商管理列表
export function listSupplier(query) {
  return request({
    url: '/app/supplier/list',
    method: 'get',
    params: query
  })
}

// 查询供应商管理详细
export function getSupplier(supplierId) {
  return request({
    url: '/app/supplier/' + supplierId,
    method: 'get'
  })
}

// 新增供应商管理
export function addSupplier(data) {
  return request({
    url: '/app/supplier',
    method: 'post',
    data: data
  })
}

// 修改供应商管理
export function updateSupplier(data) {
  return request({
    url: '/app/supplier',
    method: 'put',
    data: data
  })
}

// 删除供应商管理
export function delSupplier(supplierId) {
  return request({
    url: '/app/supplier/' + supplierId,
    method: 'delete'
  })
}

// 角色状态修改
export function changeSupplierStatus(supplierId, status) {
  const data = {
    supplierId,
    status
  }
  return request({
    url: '/app/supplier/changeStatus',
    method: 'put',
    data: data
  })
}
