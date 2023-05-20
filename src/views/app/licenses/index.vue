<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="设备id" prop="deviceId">
        <el-input
            v-model="queryParams.deviceId"
            placeholder="请输入设备id"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="是否使用" prop="used">
        <el-input
            v-model="queryParams.used"
            placeholder="请输入是否使用"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="enabled">
        <el-input
            v-model="queryParams.enabled"
            placeholder="请输入状态"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="更新时间" prop="limitStart">
        <el-date-picker clearable
                        v-model="queryParams.limitStart"
                        type="date"
                        value-format="YYYY-MM-DD"
                        placeholder="请选择更新时间">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="更新时间" prop="limitEnd">
        <el-date-picker clearable
                        v-model="queryParams.limitEnd"
                        type="date"
                        value-format="YYYY-MM-DD"
                        placeholder="请选择更新时间">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="项目名称" prop="projectName">
        <el-input
            v-model="queryParams.projectName"
            placeholder="请输入项目名称"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="联系人姓名" prop="projectUsername">
        <el-input
            v-model="queryParams.projectUsername"
            placeholder="请输入联系人姓名"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="联系人电话" prop="projectMobile">
        <el-input
            v-model="queryParams.projectMobile"
            placeholder="请输入联系人电话"
            clearable
            @keyup.enter="handleQuery"
        />
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
          v-hasPermi="['app:licenses:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['app:licenses:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['app:licenses:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['app:licenses:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="licensesList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />

      <el-table-column label="设备Id" align="center" prop="deviceId" />

      <el-table-column label="是否使用" align="center">
        <template #default="scope">
          <el-switch
              v-model="scope.row.used"
              active-value="0"
              inactive-value="1"
              @change="handleUsedChange(scope.row)"
          ></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="是否审核" align="center">
        <template #default="scope">
<!--          <el-switch-->
<!--              v-model="scope.row.enabled"-->
<!--              active-value="0"-->
<!--              inactive-value="1"-->
<!--              @change="handleEanabledChange(scope.row)"-->
<!--          ></el-switch>-->
        </template>
      </el-table-column>
      <el-table-column label="项目名称" align="center" prop="projectName" />
      <el-table-column label="联系人姓名" align="center" prop="projectUsername" />
      <el-table-column label="联系人电话" align="center" prop="projectMobile" />
      <el-table-column label="更新时间" align="center" prop="limitStart" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.limitStart, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="下载" align="center" prop="limitStart" width="180">
        <template #default="scope">
         {{scope.row.fileName}} <el-button link type="primary" icon="Edit" @click="download(scope.row)"  >下载</el-button>

        </template>
      </el-table-column>
      <el-table-column label="更新时间" align="center" prop="limitEnd" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.limitEnd, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['app:licenses:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['app:licenses:remove']">删除</el-button>
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

    <!-- 添加或修改授权管理对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="licensesRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="设备Id" prop="deviceId">
          <el-input v-model="form.deviceId" placeholder="请输入设备Id" />
        </el-form-item>
        <el-form-item label="使用情况">
          <el-radio-group v-model="form.used">
            <el-radio
                v-for="dict in license_used"
                :key="dict.value"
                :label="dict.value"
            >{{ dict.label }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="审核情况">
          <el-radio-group v-model="form.enabled">
            <el-radio
                v-for="dict in license_enabled"
                :key="dict.value"
                :label="dict.value"
            >{{ dict.label }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="项目名称" prop="projectName">
          <el-input v-model="form.projectName" placeholder="请输入项目名称" />
        </el-form-item>
        <el-form-item label="联系人姓名" prop="projectUsername">
          <el-input v-model="form.projectUsername" placeholder="请输入联系人姓名" />
        </el-form-item>
        <el-form-item label="联系人电话" prop="projectMobile">
          <el-input v-model="form.projectMobile" placeholder="请输入联系人电话" />
        </el-form-item>
        <el-form-item label="更新时间" prop="limitStart">
          <el-date-picker clearable
            v-model="form.limitStart"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择更新时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="更新时间" prop="limitEnd">
          <el-date-picker clearable
            v-model="form.limitEnd"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择更新时间">
          </el-date-picker>
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

<script setup name="Licenses">
import { listLicenses, getLicenses, delLicenses, addLicenses, updateLicenses } from "@/api/app/licenses";

const { proxy } = getCurrentInstance();

const { license_used } = proxy.useDict('license_used');
const { license_enabled } = proxy.useDict('license_enabled');

const licensesList = ref([]);
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
    deviceId: null,
    used: null,
    enabled: null,
    limitStart: null,
    limitEnd: null,
  },
  rules: {
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询授权管理列表 */
function getList() {
  loading.value = true;
  listLicenses(queryParams.value).then(response => {
    licensesList.value = response.rows;
    total.value = response.total;
    loading.value = false;
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
    licenseId: null,
    deviceId: null,
    used: null,
    enabled: null,
    limitStart: null,
    limitEnd: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null,
    remark: null
  };
  proxy.resetForm("licensesRef");
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
  ids.value = selection.map(item => item.licenseId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加授权管理";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _licenseId = row.licenseId || ids.value
  getLicenses(_licenseId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改授权管理";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["licensesRef"].validate(valid => {
    if (valid) {
      if (form.value.licenseId != null) {
        updateLicenses(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addLicenses(form.value).then(response => {
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
  const _licenseIds = row.licenseId || ids.value;
  proxy.$modal.confirm('是否确认删除授权管理编号为"' + _licenseIds + '"的数据项？').then(function() {
    return delLicenses(_licenseIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('app/licenses/export', {
    ...queryParams.value
  }, `licenses_${new Date().getTime()}.xlsx`)
}

/** 导出按钮操作 */
function download(row) {
  proxy.download('app/licenses/file/download/'+row.licenseId, {
    ...queryParams.value
  }, `licenses_${row.fileName}.txt`)
}

/** 更新审核状态 */
function handleUsedChange(row) {
  let text = row.status === "0" ? "启用" : "停用";
  proxy.$modal.confirm('确认要"' + text + '""' + row.supplierName + '"供应商吗?').then(function () {
    return changeSupplierStatus(row.supplierId, row.status);
  }).then(() => {
    proxy.$modal.msgSuccess(text + "成功");
  }).catch(function () {
    row.status = row.status === "0" ? "1" : "0";
  });
}
/** 更新审核状态 */
function handleEanabledChange(row) {
  let text = row.status === "0" ? "启用" : "停用";
  proxy.$modal.confirm('确认要3"' + text + '""' + row.supplierName + '"供应商吗?').then(function () {
    return changeSupplierStatus(row.supplierId, row.status);
  }).then(() => {
    proxy.$modal.msgSuccess(text + "成功");
  }).catch(function () {
    row.status = row.status === "0" ? "1" : "0";
  });
}

getList();
</script>
