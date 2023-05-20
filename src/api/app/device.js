import request from '@/utils/request'
import { parseStrEmpty } from "@/utils/ruoyi";

// 查询设备管理列表
export function listDevice(query) {
    return request({
        url: '/app/device/list',
        method: 'get',
        params: query
    })
}

// 查询设备管理详细
export function getDevice(deviceId) {
    return request({
        url: '/app/device/' + parseStrEmpty(deviceId),
        method: 'get'
    })
}

// 新增设备管理
export function addDevice(data) {
    return request({
        url: '/app/device',
        method: 'post',
        data: data
    })
}

// 修改设备管理
export function updateDevice(data) {
    return request({
        url: '/app/device',
        method: 'put',
        data: data
    })
}

// 删除设备管理
export function delDevice(deviceId) {
    return request({
        url: '/app/device/' + deviceId,
        method: 'delete'
    })
}
