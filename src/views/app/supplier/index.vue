<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="名称" prop="supplierName">
        <el-input
          v-model="queryParams.supplierName"
          placeholder="请输入名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="名称简写
" prop="supplierShortName">
        <el-input
          v-model="queryParams.supplierShortName"
          placeholder="请输入名称简写
"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="标识" prop="supplierSign">
        <el-input
          v-model="queryParams.supplierSign"
          placeholder="请输入标识"
          clearable

          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="级别" prop="supplierLevel">
        <el-select v-model="queryParams.supplierLevel" placeholder="请选择级别" clearable>
          <el-option
            v-for="dict in supplier_level"
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
          v-hasPermi="['app:supplier:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['app:supplier:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['app:supplier:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['app:supplier:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="supplierList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />

      <el-table-column label="名称" align="center" prop="supplierName" />
      <el-table-column label="名称简写
" align="center" prop="supplierShortName" />

      <el-table-column label="级别" align="center" prop="supplierLevel">
        <template #default="scope">
          <dict-tag :options="supplier_level" :value="scope.row.supplierLevel"/>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center">
        <template #default="scope">
          <el-switch
              v-model="scope.row.status"
              active-value="0"
              inactive-value="1"
              @change="handleStatusChange(scope.row)"
          ></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-tooltip content="供应商详细" placement="top">
            <el-button link type="primary" icon="View" @click="handleView(scope.row)" v-hasPermi="['app:supplier:query']"></el-button>
          </el-tooltip>
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['app:supplier:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['app:supplier:remove']">删除</el-button>
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

    <!-- 添加或修改供应商管理对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="supplierRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="名称" prop="supplierName">
          <el-input v-model="form.supplierName" placeholder="请输入名称" />
        </el-form-item>
        <el-form-item label="名称简写
" prop="supplierShortName">
          <el-input v-model="form.supplierShortName" placeholder="请输入名称简写
" />
        </el-form-item>
        <el-form-item label="标识" prop="supplierSign">
          <el-input v-model="form.supplierSign"  :disabled="true" :readOnly="true" placeholder="系统自动生成" />
        </el-form-item>
        <el-form-item label="级别" prop="supplierLevel">
          <el-select v-model="form.supplierLevel" placeholder="请选择级别">
            <el-option
              v-for="dict in supplier_level"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>

          <el-form-item label="状态">
            <el-radio-group v-model="form.status">
              <el-radio
                  v-for="dict in supplier_status"
                  :key="dict.value"
                  :label="dict.value"
              >{{ dict.label }}</el-radio>
            </el-radio-group>
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

    <!-- 供应商信息 -->
    <el-dialog title="供应商信息" v-model="openView" 	 width="800px" append-to-body>

      <el-form ref="supplierRef" :model="form" :rules="rules" label-width="130px">

        <el-form-item label="名称：">{{ form.supplierName }}</el-form-item>
        <el-form-item label="简写：">{{ form.supplierShortName }}</el-form-item>
        <el-form-item label="标识：">{{ form.supplierSign }}</el-form-item>
        <el-form-item label="级别：">{{ form.supplierLevel }}</el-form-item>

        <el-form-item label="备注：">{{ form.remark }}</el-form-item>
        <el-row>

          <el-col :span="24">
            <el-form-item label="任务状态：">
              <div v-if="form.status == 0">正常</div>
              <div v-else-if="form.status == 1">暂停</div>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="openView = false">关 闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Supplier">
import { listSupplier, getSupplier, delSupplier, addSupplier, updateSupplier,changeSupplierStatus } from "@/api/app/supplier";

const { proxy } = getCurrentInstance();
const { supplier_level } = proxy.useDict('supplier_level');
const { supplier_status } = proxy.useDict('supplier_status');

const supplierList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const openView = ref(false);

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 20,
    supplierName: null,
    supplierShortName: null,
    supplierSign: null,
    supplierLevel: null,
  },
  rules: {
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询供应商管理列表 */
function getList() {
  loading.value = true;
  listSupplier(queryParams.value).then(response => {
    supplierList.value = response.rows;
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
    supplierId: null,
    supplierName: null,
    supplierShortName: null,
    supplierSign: null,
    supplierLevel: null,
    status: null,
    remark: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null
  };
  proxy.resetForm("supplierRef");
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
  ids.value = selection.map(item => item.supplierId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加供应商管理";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _supplierId = row.supplierId || ids.value
  getSupplier(_supplierId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改供应商管理";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["supplierRef"].validate(valid => {
    if (valid) {
      if (form.value.supplierId != null) {
        updateSupplier(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addSupplier(form.value).then(response => {
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
  const _supplierIds = row.supplierId || ids.value;
  proxy.$modal.confirm('是否确认删除供应商管理编号为"' + _supplierIds + '"的数据项？').then(function() {
    return delSupplier(_supplierIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('app/supplier/export', {
    ...queryParams.value
  }, `supplier_${new Date().getTime()}.xlsx`)
}
/** 供应商状态修改 */
function handleStatusChange(row) {
  let text = row.status === "0" ? "启用" : "停用";
  proxy.$modal.confirm('确认要"' + text + '""' + row.supplierName + '"供应商吗?').then(function () {
    return changeSupplierStatus(row.supplierId, row.status);
  }).then(() => {
    proxy.$modal.msgSuccess(text + "成功");
  }).catch(function () {
    row.status = row.status === "0" ? "1" : "0";
  });
}

/** 供应商详细信息 */
function handleView(row) {
  getSupplier(row.supplierId).then(response => {
    form.value = response.data;
    openView.value = true;
  });
}
getList();
</script>
