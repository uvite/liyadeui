<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="产品名称" prop="productId">

        <el-select v-model="queryParams.productId"   placeholder="请输入产品型号">
          <el-option
              v-for="item in productOptions"
              :key="item.productId"
              :label="item.productName"
              :value="item.productId"
              :disabled="item.status == 1"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="供应商" prop="supplierId">
        <el-select v-model="queryParams.supplierId"   placeholder="请选择">
          <el-option
              v-for="item in supplierOptions"
              :key="item.supplierId"
              :label="item.supplierName"
              :value="item.supplierId"
              :disabled="item.status == 1"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="设备状态" prop="deviceStatus">
        <el-select v-model="queryParams.deviceStatus" placeholder="请选择设备状态" clearable>
          <el-option
            v-for="dict in device_status"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="编号" prop="deviceCode">
        <el-input
          v-model="queryParams.deviceCode"
          placeholder="请输入编号"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="入库人" prop="deviceInStockBy">
        <el-input
          v-model="queryParams.deviceInStockBy"
          placeholder="请输入入库人"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>

      <el-form-item label="出库人" prop="deviceOutStockBy">
        <el-input
          v-model="queryParams.deviceOutStockBy"
          placeholder="请输入出库人"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>

      <el-form-item label="状态" prop="stockStatus">
        <el-select v-model="queryParams.stockStatus" placeholder="请选择状态" clearable>
          <el-option
            v-for="dict in stock_status"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          v-hasPermi="['app:device:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['app:device:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['app:device:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['app:device:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="deviceList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="设备编号" align="center" prop="deviceCode" />
      <el-table-column label="产品型号" align="center" prop="product.productName" />
      <el-table-column label="产品类型" align="center" prop="product.productType" >
        <template #default="scope">
          <dict-tag :options="product_type" :value="scope.row.product.productType"/>
        </template>
      </el-table-column>
      <el-table-column label="设备授权" align="center" prop="deviceStatus">
        <template #default="scope">
          <dict-tag :options="device_status" :value="scope.row.deviceStatus"/>
        </template>
      </el-table-column>
      <el-table-column label="入库时间" align="center" prop="deviceInStockTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.deviceInStockTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="入库人" align="center" prop="deviceInStockBy" />
      <el-table-column label="出库时间" align="center" prop="deviceOutStockTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.deviceOutStockTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="出库人" align="center" prop="deviceOutStockBy" />

      <el-table-column label="存货状态" align="center" prop="stockStatus">
        <template #default="scope">
          <dict-tag :options="stock_status" :value="scope.row.stockStatus"/>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['app:device:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['app:device:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改设备管理对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="deviceRef" :model="form" :rules="rules" label-width="80px">

        <el-form-item label="产品型号" prop="supplierId">
          <el-select v-model="form.productId"   placeholder="请输入产品型号">
            <el-option
                v-for="item in productOptions"
                :key="item.productId"
                :label="item.productName"
                :value="item.productId"
                :disabled="item.status == 1"
            ></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="供应商" prop="supplierId">
          <el-select v-model="form.supplierId"   placeholder="请选择">
            <el-option
                v-for="item in supplierOptions"
                :key="item.supplierId"
                :label="item.supplierName"
                :value="item.supplierId"
                :disabled="item.status == 1"
            ></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="设备授权" prop="deviceStatus">
          <el-select v-model="form.deviceStatus" placeholder="请选择设备状态">
            <el-option
              v-for="dict in device_status"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="设备编号" prop="deviceCode">
          <el-input v-model="form.deviceCode" placeholder="请输入设备编号" />
        </el-form-item>

        <el-form-item label="入库人" prop="deviceInStockBy">
          <el-input v-model="form.deviceInStockBy" placeholder="请输入入库人" />
        </el-form-item>
        <el-form-item label="入库时间" prop="deviceInStockTime">
          <el-date-picker clearable
            v-model="form.deviceInStockTime"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择入库时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="出库人" prop="deviceOutStockBy">
          <el-input v-model="form.deviceOutStockBy" placeholder="请输入出库人" />
        </el-form-item>
        <el-form-item label="出库时间" prop="deviceOutStockTime">
          <el-date-picker clearable
            v-model="form.deviceOutStockTime"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择出库时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="状态" prop="stockStatus">
          <el-select v-model="form.stockStatus" placeholder="请选择状态">
            <el-option
              v-for="dict in stock_status"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Device">
import { listDevice, getDevice, delDevice, addDevice, updateDevice } from "@/api/app/device";

const { proxy } = getCurrentInstance();
const { device_status, stock_status ,product_type} = proxy.useDict('device_status', 'stock_status','product_type');
const productOptions = ref([]);
const supplierOptions = ref([]);
const deviceList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    productId: null,
    supplierId: null,
    deviceStatus: null,
    deviceCode: null,
    deviceInStockBy: null,
    deviceInStockTime: null,
    deviceOutStockBy: null,
    deviceOutStockTime: null,
    stockStatus: null,
  },
  rules: {
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询设备管理列表 */
function getList() {
  loading.value = true;
  listDevice(queryParams.value).then(response => {
    deviceList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });

  getDevice().then(response => {

    supplierOptions.value = response.suppliers;
    productOptions.value = response.products;
  });
}

// 取消按钮
function cancel() {
  open.value = false;
  reset();
}

// 表单重置
function reset() {
  form.value = {
    deviceId: null,
    productId: null,
    supplierId: null,
    deviceStatus: null,
    deviceCode: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null,
    remark: null,
    deviceInStockBy: null,
    deviceInStockTime: null,
    deviceOutStockBy: null,
    deviceOutStockTime: null,
    stockStatus: null,
    deleteBy: null,
    deleteTime: null,
    isDeleted: null
  };
  proxy.resetForm("deviceRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.deviceId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  getDevice().then(response => {

    supplierOptions.value = response.suppliers;
    productOptions.value = response.products;
    open.value = true;
    title.value = "添加设备管理";
  });

}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _deviceId = row.deviceId || ids.value
  getDevice(_deviceId).then(response => {
    supplierOptions.value = response.suppliers;
    productOptions.value = response.products;
    form.value = response.data;
    form.value.productId=parseInt(response.data.productId)
    form.value.supplierId=parseInt(response.data.supplierId)
    open.value = true;
    title.value = "修改设备管理";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["deviceRef"].validate(valid => {
    if (valid) {
      if (form.value.deviceId != null) {
        updateDevice(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addDevice(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}

/** 删除按钮操作 */
function handleDelete(row) {
  const _deviceIds = row.deviceId || ids.value;
  proxy.$modal.confirm('是否确认删除设备管理编号为"' + _deviceIds + '"的数据项？').then(function() {
    return delDevice(_deviceIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('app/device/export', {
    ...queryParams.value
  }, `device_${new Date().getTime()}.xlsx`)
}


getList();
</script>
