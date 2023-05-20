<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="名称" prop="productName">
        <el-input
            v-model="queryParams.productName"
            placeholder="请输入名称"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="类型
" prop="productType">
        <el-select v-model="queryParams.productType" placeholder="请选择类型
" clearable>
          <el-option
              v-for="dict in product_type"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="供应商
" prop="productSupplierCode">
        <el-input
            v-model="queryParams.productSupplierCode"
            placeholder="请输入供应商
"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="产品编号
" prop="productCode">
        <el-input
            v-model="queryParams.productCode"
            placeholder="请输入产品编号
"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="参考价格" prop="productPrice">
        <el-input
            v-model="queryParams.productPrice"
            placeholder="请输入参考价格"
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
            v-hasPermi="['app:product:add']"
        >新增
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="success"
            plain
            icon="Edit"
            :disabled="single"
            @click="handleUpdate"
            v-hasPermi="['app:product:edit']"
        >修改
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="danger"
            plain
            icon="Delete"
            :disabled="multiple"
            @click="handleDelete"
            v-hasPermi="['app:product:remove']"
        >删除
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="warning"
            plain
            icon="Download"
            @click="handleExport"
            v-hasPermi="['app:product:export']"
        >导出
        </el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="productList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center"/>

      <el-table-column label="型号名称" align="center" prop="productName"/>
      <el-table-column label="型号编号" align="center" prop="productCode"/>
      <el-table-column label="参考价格" align="center" prop="productPrice"/>
      <el-table-column label="供应商" align="center" prop="supplier.supplierName"/>

      <el-table-column label="类型" align="center" prop="productType">
        <template #default="scope">
          <dict-tag :options="product_type" :value="scope.row.productType"/>
        </template>
      </el-table-column>


      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['app:product:edit']">
            修改
          </el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
                     v-hasPermi="['app:product:remove']">删除
          </el-button>
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

    <!-- 添加或修改产品管理对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="productRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="名称" prop="productName">
          <el-input v-model="form.productName" placeholder="请输入名称"/>
        </el-form-item>
        <el-form-item label="类型" prop="productType">
          <el-select v-model="form.productType" placeholder="请选择类型
">
            <el-option
                v-for="dict in product_type"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="供应商" prop="productSupplierCode">
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
        <el-form-item label="产品编号" prop="productCode">
          <el-input v-model="form.productCode" placeholder="请输入产品编号"/>
        </el-form-item>
        <el-form-item label="参考价格" prop="productPrice">
          <el-input v-model="form.productPrice" placeholder="请输入参考价格"/>
        </el-form-item>

        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容"/>
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

<script setup name="Product">
import {listProduct, getProduct, delProduct, addProduct, updateProduct} from "@/api/app/product";
import {getSupplier} from "@/api/app/supplier";

const {proxy} = getCurrentInstance();
const {product_type} = proxy.useDict('product_type');

const supplierOptions = ref([]);
const productList = ref([]);
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
    pageSize: 20,
    productName: null,
    productType: null,
    productSupplierCode: null,
    productCode: null,
    productPrice: null,
    productCreateTime: null,
  },
  rules: {}
});

const {queryParams, form, rules} = toRefs(data);

/** 查询产品管理列表 */
function getList() {
  loading.value = true;
  listProduct(queryParams.value).then(response => {
    productList.value = response.rows;
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
    productId: null,
    productName: null,
    productType: null,
    productSupplierCode: null,
    productCode: null,
    productPrice: null,
    productCreateTime: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null,
    remark: null
  };
  proxy.resetForm("productRef");
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
  ids.value = selection.map(item => item.productId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();

  getProduct().then(response => {

    supplierOptions.value = response.suppliers;
    open.value = true;
    title.value = "添加产品管理";
  });

}

/** 修改按钮操作 */
async function   handleUpdate(row) {
  reset();
  const _productId = row.productId || ids.value
  getProduct(_productId).then(async response => {
    supplierOptions.value = response.suppliers;

   // form.value.productSupplierCode = response.postIds;
    form.value = response.data;
   // const supplier=await getSupplier(form.value.productSupplierCode)

   // form.value.productSupplierCode=supplier.data.supplierId
    form.value.supplierId=parseInt(response.data.supplierId)
    open.value = true;
    title.value = "修改产品管理";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["productRef"].validate(valid => {
    if (valid) {
      if (form.value.productId != null) {
        updateProduct(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addProduct(form.value).then(response => {
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
  const _productIds = row.productId || ids.value;
  proxy.$modal.confirm('是否确认删除产品管理编号为"' + _productIds + '"的数据项？').then(function () {
    return delProduct(_productIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {
  });
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('app/product/export', {
    ...queryParams.value
  }, `product_${new Date().getTime()}.xlsx`)
}

getList();
</script>
