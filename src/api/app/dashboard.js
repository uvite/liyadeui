import request from '@/utils/request'
import { parseStrEmpty } from "@/utils/ruoyi";

// dashboard
export function analysis(query) {
    return request({
        url: '/app/dashboard/analysis',
        method: 'get',
        params: query
    })
}
