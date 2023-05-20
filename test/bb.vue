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
      <el-table-column label="主键" align="center" prop="privateId"/>
      <el-table-column label="公钥" align="center" prop="publicKey"/>
      <el-table-column label="私钥" align="center" prop="privateKey"/>
      <el-table-column label="加密类型" align="center" prop="privateType"/>
      <el-table-column label="有效期" align="center" prop="validDate" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.validDate, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark"/>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['app:private:edit']">
            修改
          </el-button>
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
    <el-dialog :title="title" v-model="open" width="1000px" height="600px" append-to-body>
      <el-form ref="privateRef" :model="form" :rules="rules" label-width="80px">
        <el-tabs style="padding: 0 10px 0 10px" tab-position="top" v-model="activeName" class="demo-tabs"
                 @tab-click="handleClick">
          <!-- rsa -->
          <el-tab-pane label="rsa" name="RSA">
            <span slot="label"><i class="el-icon-copy-document"></i> RSA</span>
            <el-divider content-position="left">1.生成秘钥对</el-divider>
            <el-row :gutter="20">
              <el-col :span="12">
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
                <el-button type="text" style="float:right">rsa加密公钥</el-button>
                <el-input disabled placeholder="生成的公钥可用于加密数据" v-model="rsa_publicKey" type="textarea"
                          :autosize="{ minRows: 15, maxRows: 15 }">
                </el-input>
              </el-col>
              <el-col :span="12">
                <el-button type="text" style="float:right">rsa加密私钥</el-button>
                <el-input disabled placeholder="私钥可用于解密公钥加密的数据" v-model="rsa_privateKey" type="textarea"
                          :autosize="{ minRows: 15, maxRows: 15 }">
                </el-input>
              </el-col>
            </el-row>
<!--            <el-divider content-position="left"> 2.加密数据-->
<!--              <el-tag class="el-icon-info" size="mini" type="warning">需要先生成秘钥对</el-tag>-->
<!--              <span v-show="showUseTimeRsa" class="red">-->
<!--                    <el-tag class="el-icon-success" style="margin-left:5px" size="mini"-->
<!--                            type="success">耗时: {{ useTimeRsa }} ms</el-tag>-->
<!--                  </span>-->
<!--            </el-divider>-->

<!--            <el-row :gutter="20">-->
<!--              <el-col :span="12">-->
<!--                <el-button type="primary" plain icon="el-icon-lock" size="small" style="float:left"-->
<!--                           @click="encrypt('rsa')">执行-->
<!--                </el-button>-->
<!--                <el-button icon="el-icon-refresh" size="small" style="float:left" @click="needEncryptDataRsa = ''">清空-->
<!--                </el-button>-->
<!--                <el-button type="text" style="float:right">需要加密的数据</el-button>-->
<!--                <el-input placeholder="填写你需要加密的数据, 可以为空" v-model="needEncryptDataRsa" type="textarea"-->
<!--                          :autosize="{ minRows: 8, maxRows: 10 }">-->
<!--                </el-input>-->
<!--              </el-col>-->
<!--              <el-col :span="12">-->
<!--                <el-button type="text" style="float:right">结果</el-button>-->
<!--                <el-input disabled v-model="encryptedDataRsa" type="textarea" :autosize="{ minRows: 8, maxRows: 10 }">-->
<!--                </el-input>-->
<!--              </el-col>-->
<!--            </el-row>-->
<!--            <el-divider content-position="left">3.解密数据-->
<!--              <el-tag class="el-icon-info" size="mini" type="warning">需要先生成秘钥对, 并且加密数据</el-tag>-->
<!--              <span v-show="showUseTimeRsa_decrypt" class="red">-->
<!--                    <el-tag style="margin-left:5px" class="el-icon-success" size="mini"-->
<!--                            type="success">耗时: {{ useTimeRsa_decrypt }} ms</el-tag>-->
<!--                  </span>-->
<!--            </el-divider>-->
<!--            <el-row :gutter="20">-->
<!--              <el-col :span="12">-->
<!--                <el-button type="primary" plain icon="el-icon-unlock" size="small" style="float:left"-->
<!--                           @click="decrypt('rsa')">执行-->
<!--                </el-button>-->
<!--                <el-button icon="el-icon-refresh" size="small" style="float:left" @click="decryptDataRsa = ''">清空-->
<!--                </el-button>-->
<!--                <el-button type="text" style="float:right">验证结果</el-button>-->
<!--                <el-input disabled placeholder="根据生成的结果用私钥解密" v-model="decryptDataRsa" type="textarea"-->
<!--                          :autosize="{ minRows: 8, maxRows: 10 }">-->
<!--                </el-input>-->
<!--              </el-col>-->
<!--            </el-row>-->

          </el-tab-pane>
          <!-- sm2 -->
          <el-tab-pane label="sm2" name="sm2">
            <span slot="label"><i class="el-icon-copy-document"></i> SM2</span>
            <el-divider content-position="left">1.生成秘钥对
            </el-divider>
            <el-row :gutter="20">
              <el-col :span="12">
                <div style="float:left;font-size:14px">
                  加密模式:
                  <el-select style="width:100px" v-model="sm2Type" class="m-2" placeholder="Select" size="small">
                    <el-option label='C1C3C2' :value='1'/>
                    <el-option label='C1C2C3' :value='0'/>
                  </el-select>
                </div>
                <el-button type="primary" plain size="small" style="float:left; margin-left:5px"
                           @click="generateSm2RsaKeyPair">生成
                </el-button>
                <el-button type="text" style="float:right">sm2加密公钥</el-button>
                <el-input disabled placeholder="生成的公钥可用于加密数据" v-model="sm2_publicKey" type="textarea"
                          :autosize="{ minRows: 8, maxRows: 10 }">
                </el-input>
              </el-col>
              <el-col :span="12">
                <el-button type="text" style="float:right">sm2加密私钥</el-button>
                <el-input disabled placeholder="私钥可用于解密公钥加密的数据" v-model="sm2_privateKey" type="textarea"
                          :autosize="{ minRows: 8, maxRows: 10 }">
                </el-input>
              </el-col>
            </el-row>

          </el-tab-pane>
<!--                    &lt;!&ndash; md5 &ndash;&gt;-->
<!--                    <el-tab-pane label="a" name="md5">-->
<!--                      <span slot="label"><i class="el-icon-copy-document"></i> MD5</span>-->
<!--                      <el-row :gutter="20">-->
<!--                        <el-col :span="12">-->
<!--                          <el-input placeholder="请输入" v-model="md5Text" type="textarea" :autosize="{ minRows: 8, maxRows: 10 }">-->
<!--                          </el-input>-->
<!--                          <div style="float:left; margin-top:5px">-->
<!--                            <el-button size="small" type="primary" plain @click="encrypt('md5')">MD5加密</el-button>-->
<!--                            <el-button size="small">清空</el-button>-->
<!--                            <el-tag style="margin-left:5px" v-show="showUseTimeMd5" class="el-icon-success" type="success">耗时:-->
<!--                              {{ useTimeMd5 }} ms-->
<!--                            </el-tag>-->
<!--                          </div>-->
<!--                        </el-col>-->
<!--                        <el-col :span="12">-->
<!--                          <el-input disabled placeholder="" v-model="md5EncryptedData" type="textarea"-->
<!--                                    :autosize="{ minRows: 8, maxRows: 10 }">-->
<!--                          </el-input>-->
<!--                        </el-col>-->
<!--                      </el-row>-->
<!--                    </el-tab-pane>-->

        </el-tabs>

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

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
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
  open.value = true;
  title.value = "添加秘钥";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _privateId = row.privateId || ids.value
  getPrivate(_privateId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改秘钥";
  });
}

/** 提交按钮 */
function submitForm() {
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

const activeName = ref("RSA")
const rsaLength = ref("1024")
const rsaType = ref("SHA-512")
const sm2Type = ref(0)
const sm2PublicKeyText = ref()
const sm2PrivateKeyText = ref()
const needEncryptDataRsa = ref()
const encryptedDataRsa = ref()
const decryptDataRsa = ref()
const showUseTimeRsa = ref()
const useTimeRsa = ref()

const showUseTimeSm2 = ref()
const useTimeSm2 = ref()
const encryptedDataSm2 = ref()


const generateRsaKeyPair = async () => {

  await createRsaKeyPair(rsaLength.value, rsaType.value, (privateKey, publicKey) => {

    form.value.publicKey = publicKey;
    form.value.privateKey = privateKey;
  })
}

const generateSm2RsaKeyPair = () => {
  const data = sm2.generateKeyPairHex()
  sm2PublicKeyText.value = data.publicKey;
  sm2PrivateKeyText.value = data.privateKey;

  form.value.publicKey = data.publicKey;
  form.value.privateKey = data.privateKey;

}

const encrypt = (type) => {
  const start = new Date().getTime()
  if (type === 'rsa') {
    const data = needEncryptDataRsa.value;
    const pbkey = form.value.publicKey;
    if (!pbkey) {
      this.$message({
        message: '请先生成公钥',
        type: 'warning',
      })
      return;
    }
    showUseTimeRsa.value = false
    const e = rsaEncrypt(data, pbkey)
    const end = new Date().getTime()
    useTimeRsa.value = end - start
    encryptedDataRsa.value = e
    showUseTimeRsa.value = true
  } else if (type === 'sm2') {
    const data = needEncryptDataSm2.value
    const pbkey = sm2PublicKeyText.value
    if (!pbkey) {
      this.$message({
        message: '请先生成公钥',
        type: 'warning',
      })
      return
    }
    showUseTimeSm2.value = false
    const e = this.sm2Encrypt(data, pbkey, sm2Type.value)
    const end = new Date().getTime()
    useTimeSm2.value = end - start
    encryptedDataSm2.value = e
    showUseTimeSm2.value = true
  }
}


const decrypt = (type) => {
  const start = new Date().getTime()
  if (type === 'rsa') {
   // const data = this.needEncryptDataRsa
    const prvkey = form.value.privateKey;
    if (!prvkey) {
      this.$message({
        message: '请先生成私钥',
        type: 'warning'
      })
      return
    }

    const result = encryptedDataRsa.value
    if (!result) {
      this.$message({
        message: '请先使用公钥加密数据',
        type: 'warning'
      })
      return
    }
   // this.showUseTimeRsa_decrypt = false
    decryptDataRsa.value = rsaDecrypt(result, prvkey)
    // const end = new Date().getTime()
    // this.useTimeRsa_decrypt = end - start
    // this.showUseTimeRsa_decrypt = true
    this.$message({ message: '解密成功', type: 'success' })
  } else if (type === 'sm2') {
    const prvkey = this.sm2PrivateKeyText;
    if (!prvkey) {
      this.$message({
        message: '请先生成私钥',
        type: 'warning'
      })
      return
    }
    const result = this.encryptedDataSm2
    if (!result) {
      this.$message({
        message: '请先使用公钥加密数据',
        type: 'warning'
      })
      return
    }
    this.showUseTimeSm2_decrypt = false
    this.decryptDataSm2 = this.sm2Decrypt(result, prvkey, this.sm2Type)
    const end = new Date().getTime()
    this.useTimeSm2_decrypt = end - start
    this.$message({ message: '解密成功', type: 'success' })
    this.showUseTimeSm2_decrypt = true

  }
}
</script>
