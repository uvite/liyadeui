<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="私钥" prop="privateKey">
        <el-input
            v-model="queryParams.privateKey"
            placeholder="请输入私钥"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="有效期" prop="validDate">
        <el-date-picker clearable
                        v-model="queryParams.validDate"
                        type="date"
                        value-format="YYYY-MM-DD"
                        placeholder="请选择有效期">
        </el-date-picker>
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
            v-hasPermi="['app:private:add']"
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
            v-hasPermi="['app:private:edit']"
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
            v-hasPermi="['app:private:remove']"
        >删除
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="warning"
            plain
            icon="Download"
            @click="handleExport"
            v-hasPermi="['app:private:export']"
        >导出
        </el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="privateList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center"/>
       <el-table-column label="公钥"  width="100" align="center" >
        <template #default="scope">
          <span>*****</span>
        </template>
      </el-table-column>
      <el-table-column label="私钥"  width="100" align="center" >
        <template #default="scope">
          <span>*****</span>
        </template>
      </el-table-column>
      <el-table-column label="加密类型"   width="100" align="center" prop="privateType"/>


      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
<!--          <el-button link type="primary" icon="Edit" @click="handleTest(scope.row)" v-hasPermi="['app:private:edit']">-->
<!--            测试-->
<!--          </el-button>-->
<!--          <el-button link type="primary" icon="Edit" @click="handleSend(scope.row)" v-hasPermi="['app:private:edit']">-->
<!--            分发-->
<!--          </el-button>-->
<!--          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['app:private:edit']">-->
<!--            修改-->
<!--          </el-button>-->
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
                     v-hasPermi="['app:private:remove']">删除
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

    <!-- 添加或修改秘钥对话框 -->
    <el-dialog :title="title" v-model="open" width="900px" height="600px" append-to-body>
      <el-form ref="privateRef" :model="form" :rules="rules" label-width="80px">

        <el-form-item label="生成秘钥" prop="">

        <el-tabs style="padding: 0 10px 0 10px" tab-position="top" v-model="form.privateType" class="demo-tabs"
                 @tab-click="handleClick">
          <!-- rsa -->
          <el-tab-pane label="rsa" name="RSA">
            <el-row :gutter="20">
              <el-col :span="24">
                <div style="float:left;font-size:14px">
                  秘钥长度:
                  <el-select style="width:100px" v-model="rsaLength" class="m-2" placeholder="Select" size="small">
                    <el-option label='512' value='512'/>
                    <el-option label='1024' value='1024'/>
                    <el-option label='2048' value='2048'/>
                    <el-option label='4096' value='4096'/>
                  </el-select>
                  加密方式:
                  <el-select style="width:120px" v-model="rsaType" class="m-2" placeholder="Select" size="small">
                    <el-option label='SHA-1' value='SHA-1'/>
                    <el-option label='SHA-256' value='SHA-256'/>
                    <el-option label='SHA-384' value='SHA-384'/>
                    <el-option label='SHA-512' value='SHA-512'/>
                  </el-select>
                </div>
                <el-button type="primary" plain size="small" style="float:left; margin-left:5px"
                           @click="generateRsaKeyPair()">生成
                </el-button>

              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">

                <el-button type="text" style="float:left">rsa加密公钥</el-button>
                <el-input disabled placeholder="生成的公钥可用于加密数据" v-model="rsa_publicKey" type="textarea"
                          :autosize="{ minRows: 8, maxRows: 10 }">
                </el-input>
              </el-col>
              <el-col :span="12">
                <el-button type="text" style="float:left">rsa加密私钥</el-button>
                <el-input disabled placeholder="私钥可用于解密公钥加密的数据" v-model="rsa_privateKey" type="textarea"
                          :autosize="{ minRows: 8, maxRows: 10 }">
                </el-input>
              </el-col>
            </el-row>

          </el-tab-pane>
<!--          &lt;!&ndash; sm2 &ndash;&gt;-->
<!--          <el-tab-pane label="sm2" name="SM2">-->
<!--            <el-row :gutter="20">-->
<!--              <el-col :span="24">-->
<!--                <div style="float:left;font-size:14px">-->
<!--                  加密模式:-->
<!--                  <el-select style="width:100px" v-model="sm2Type" class="m-2" placeholder="Select" size="small">-->
<!--                    <el-option label='C1C3C2' :value='1'/>-->
<!--                    <el-option label='C1C2C3' :value='0'/>-->
<!--                  </el-select>-->
<!--                </div>-->
<!--                <el-button type="primary" plain size="small" style="float:left; margin-left:5px"-->
<!--                           @click="generateSm2RsaKeyPair">生成-->
<!--                </el-button>-->
<!--              </el-col>-->
<!--            </el-row>-->
<!--            <el-row :gutter="20">-->
<!--              <el-col :span="12">-->

<!--                <el-button type="text" style="float:left">sm2加密公钥</el-button>-->
<!--                <el-input disabled placeholder="生成的公钥可用于加密数据" v-model="sm2_publicKey" type="textarea"-->
<!--                          :autosize="{ minRows: 8, maxRows: 10 }">-->
<!--                </el-input>-->
<!--              </el-col>-->
<!--              <el-col :span="12">-->
<!--                <el-button type="text" style="float:left">sm2加密私钥</el-button>-->
<!--                <el-input disabled placeholder="私钥可用于解密公钥加密的数据" v-model="sm2_privateKey" type="textarea"-->
<!--                          :autosize="{ minRows: 8, maxRows: 10 }">-->
<!--                </el-input>-->
<!--              </el-col>-->
<!--            </el-row>-->

<!--          </el-tab-pane>-->
        </el-tabs>
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

<script setup name="Private">
import {listPrivate, getPrivate, delPrivate, addPrivate, updatePrivate} from "@/api/app/private";
import {
  rsaEncrypt,
  rsaDecrypt,
  md5Encrypt,
  createRsaKeyPair,
} from '@/utils/crypto'
import {JSEncrypt} from "jsencrypt"
import {sm2, sm3} from 'sm-crypto'

const {proxy} = getCurrentInstance();

const privateList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");


const rsaLength = ref("1024")
const rsaType = ref("SHA-512")
const sm2Type = ref(0)

const rsa_publicKey = ref()
const rsa_privateKey = ref()
const sm2_publicKey = ref()
const sm2_privateKey = ref()

const data = reactive({
  form: { },
  queryParams: {
    pageNum: 1,
    pageSize: 20,
    publicKey: null,
    privateKey: null,
    privateType: null,
    validDate: null,
  },
  rules: {}
});

const {queryParams, form, rules} = toRefs(data);

/** 查询秘钥列表 */
function getList() {
  loading.value = true;
  listPrivate(queryParams.value).then(response => {
    privateList.value = response.rows;
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
    privateId: null,
    publicKey: null,
    privateKey: null,
    privateType: null,
    validDate: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null,
    remark: null
  };
  proxy.resetForm("privateRef");
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
  ids.value = selection.map(item => item.privateId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  form.value.privateType= "RSA"
  open.value = true;
  title.value = "添加秘钥";
}
/** 测试 */
function handleTest() {
  reset();
  form.value.privateType= "RSA"
  open.value = true;
  title.value = "添加秘钥";
}
/** 分发 */
function handleSend() {
  reset();
  form.value.privateType= "RSA"
  open.value = true;
  title.value = "添加秘钥";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _privateId = row.privateId || ids.value
  getPrivate(_privateId).then(response => {
    form.value = response.data;

    if (form.value.privateType=="RSA"){
      rsa_privateKey.value=form.value.privateKey
      rsa_publicKey.value=form.value.publicKey
    }
    if (form.value.privateType=="SM2"){
      sm2_privateKey.value=form.value.privateKey
      sm2_publicKey.value=form.value.publicKey
    }
    open.value = true;
    title.value = "修改秘钥";
  });
}

/** 提交按钮 */
function submitForm() {
  if (form.value.privateType=="RSA"){
    form.value.privateKey=rsa_privateKey
    form.value.publicKey=rsa_publicKey
  }
  if (form.value.privateType=="SM2"){
    form.value.privateKey=sm2_privateKey
    form.value.publicKey=sm2_publicKey
  }



  proxy.$refs["privateRef"].validate(valid => {
    if (valid) {
      if (form.value.privateId != null) {
        updatePrivate(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addPrivate(form.value).then(response => {
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
  const _privateIds = row.privateId || ids.value;
  proxy.$modal.confirm('是否确认删除秘钥编号为"' + _privateIds + '"的数据项？').then(function () {
    return delPrivate(_privateIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {
  });
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('app/private/export', {
    ...queryParams.value
  }, `private_${new Date().getTime()}.xlsx`)
}

getList();


const generateRsaKeyPair = async () => {
  var crypt = new JSEncrypt();
  var publickKey = crypt.getPublicKey();
  var privateKey = crypt.getPrivateKey();
  rsa_publicKey.value=publickKey
  rsa_privateKey.value=privateKey
  // console.log("publickKey",publickKey);
  // console.log("privateKey",privateKey);
  // await createRsaKeyPair(rsaLength.value, rsaType.value, (privateKey, publicKey) => {
  //   rsa_publicKey.value = publicKey;
  //   rsa_privateKey.value = privateKey;
  // })
}

const generateSm2RsaKeyPair = () => {
  const data = sm2.generateKeyPairHex()
  sm2_publicKey.value = data.publicKey;
  sm2_privateKey.value = data.privateKey;

}


</script>
