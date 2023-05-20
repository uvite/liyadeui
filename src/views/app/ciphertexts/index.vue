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
      <el-form-item label="供应商" prop="provider">
        <el-input
          v-model="queryParams.provider"
          placeholder="请输入供应商"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="密文内容" prop="ciphertext">
        <el-input
          v-model="queryParams.ciphertext"
          placeholder="请输入密文内容"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="密文路径" prop="ciphertextPath">
        <el-input
          v-model="queryParams.ciphertextPath"
          placeholder="请输入密文路径"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="密文md5" prop="md5">
        <el-input
          v-model="queryParams.md5"
          placeholder="请输入密文md5"
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
          v-hasPermi="['app:ciphertexts:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['app:ciphertexts:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['app:ciphertexts:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['app:ciphertexts:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="ciphertextsList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" align="center" prop="id" />
      <el-table-column label="设备id" align="center" prop="deviceId" />
      <el-table-column label="状态" align="center" prop="status" />
      <el-table-column label="产品类型" align="center" prop="productType" />
      <el-table-column label="供应商" align="center" prop="provider" />
      <el-table-column label="密文内容" align="center" prop="ciphertext" />
      <el-table-column label="密文路径" align="center" prop="ciphertextPath" />
      <el-table-column label="密文md5" align="center" prop="md5" />
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['app:ciphertexts:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['app:ciphertexts:remove']">删除</el-button>
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

    <!-- 添加或修改密文管理对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="ciphertextsRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="设备id" prop="deviceId">
          <el-input v-model="form.deviceId" placeholder="请输入设备id" />
        </el-form-item>
        <el-form-item label="供应商" prop="provider">
          <el-input v-model="form.provider" placeholder="请输入供应商" />
        </el-form-item>
        <el-form-item label="密文内容" prop="ciphertext">
          <el-input v-model="form.ciphertext" placeholder="请输入密文内容" />
        </el-form-item>
        <el-form-item label="密文路径" prop="ciphertextPath">
          <el-input v-model="form.ciphertextPath" placeholder="请输入密文路径" />
        </el-form-item>
        <el-form-item label="密文md5" prop="md5">
          <el-input v-model="form.md5" placeholder="请输入密文md5" />
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

<script setup name="Ciphertexts">
import { listCiphertexts, getCiphertexts, delCiphertexts, addCiphertexts, updateCiphertexts } from "@/api/app/ciphertexts";

const { proxy } = getCurrentInstance();

const ciphertextsList = ref([]);
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
    status: null,
    productType: null,
    provider: null,
    ciphertext: null,
    ciphertextPath: null,
    md5: null,
  },
  rules: {
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询密文管理列表 */
function getList() {
  loading.value = true;
  listCiphertexts(queryParams.value).then(response => {
    ciphertextsList.value = response.rows;
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
    id: null,
    deviceId: null,
    status: null,
    productType: null,
    provider: null,
    ciphertext: null,
    ciphertextPath: null,
    md5: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null,
    remark: null
  };
  proxy.resetForm("ciphertextsRef");
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
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加密文管理";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getCiphertexts(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改密文管理";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["ciphertextsRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateCiphertexts(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addCiphertexts(form.value).then(response => {
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
  const _ids = row.id || ids.value;
  proxy.$modal.confirm('是否确认删除密文管理编号为"' + _ids + '"的数据项？').then(function() {
    return delCiphertexts(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('app/ciphertexts/export', {
    ...queryParams.value
  }, `ciphertexts_${new Date().getTime()}.xlsx`)
}

getList();
</script>
