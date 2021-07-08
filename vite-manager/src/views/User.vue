<template>
  <div class="user-manage">
    <div class="query-form">
      <el-form ref="form" :inline="true" :model="user">
        <el-form-item label="用户ID" prop="userId">
          <el-input v-model="user.userId" placeholder="请输入用户ID" />
        </el-form-item>
        <el-form-item label="用户名称" prop="userName">
          <el-input v-model="user.userName" placeholder="请输入用户名称" />
        </el-form-item>
        <el-form-item label="状态" prop="state">
          <el-select v-model="user.state">
            <el-option :value="0" label="所有"></el-option>
            <el-option :value="1" label="在职"></el-option>
            <el-option :value="2" label="离职"></el-option>
            <el-option :value="3" label="试用期"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="handleReset('form')">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="base-table">
      <div class="action">
        <el-button type="primary" @click="handleCreate">新增</el-button>
        <el-button type="danger" @click="handlePatchDel">批量删除</el-button>
      </div>
      <el-table :data="userList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column 
          v-for="item in columns" 
          :key="item.prop"
          :label="item.label"
          :prop="item.prop"
          :width="item.width"
          :formatter="item.formatter"
        >
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="scope">
            <el-button
              size="mini" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button
              type="danger"
              size="mini"
              @click="handleDel(scope.row)"
              >删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination 
          class="pagination"
          background
          layout="prev, pager, next"
          :total="pager.total"
          :page-size="pager.pageSize"
          @current-change="handleCurrentChange"
        ></el-pagination>
    </div>
    <el-dialog title="新增" v-model="showModal">
      <el-form
        ref="dialogForm"
        :model="userForm"
        label-width="100px"
        :rules="rules"
      >
        <el-form-item label="用户名" prop="userName">
          <el-input v-model="userForm.userName" :disabled="action == 'edit'" placeholder="请输入用户名称"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="userEmail">
          <el-input
            v-model="userForm.userEmail"
            :disabled="action == 'edit'"
            placeholder="请输入用户邮箱">
            <template #append>@qq.com</template>
          </el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="userForm.mobile" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="岗位" prop="job">
          <el-input v-model="userForm.job" placeholder="请输入岗位" />
        </el-form-item>
        <el-form-item label="状态" prop="state">
          <el-select v-model="userForm.state">
            <el-option :value="1" label="在职"></el-option>
            <el-option :value="2" label="离职"></el-option>
            <el-option :value="3" label="试用期"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="系统角色" prop="roleList">
          <el-select v-model="userForm.roleList" multiple placeholder="请选择用户系统角色">
            <el-option
              v-for="role in roleList"
              :key="role._id"
              :label="role.roleName"
              :value="role._id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="部门" prop="deptId">
          <el-cascader 
            v-model="userForm.deptId"
            placeholder="请选择所属部门"
            :options="deptList"
            :props="{ checkStrictly: true, value: '_id', label: 'deptName' }"
            clearable
            style="width: 100%"
          >
          </el-cascader>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleClose">取 消</el-button>
          <el-button type="primary" @click="handleSubmit">确 定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import {getCurrentInstance, onMounted, ref,reactive, toRaw } from 'vue'
import { getUserList,userDel,getRoleAllList,getDeptList,userSubmit } from './../api'
import { ElMessage } from 'element-plus'
import utils from './../utils/utils'
export default {
  name:"user",
  setup () {
    //   获取Composition API 上下文对象
    const { ctx } = getCurrentInstance();
    const user = reactive({
      state: 0,
    })
    const userForm = reactive({
      state: 3
    })
    const userList = ref([])
    const pager = reactive({
      pageNum:1,
      pageSize:10
    })
    // 选中用户列表对象
    const checkedUserIds = ref([])
    // 定义动态表格格式
    const columns = reactive([
      {
        label: "用户ID",
        prop: "userId",
      },
      {
        label: "用户名",
        prop: "userName",
      },
      {
        label: "用户邮箱",
        prop: "userEmail",
      },
      {
        label: "用户角色",
        prop: "role", 
        formatter(row, column, value) {
          return {
            0: "管理员",
            1: "普通用户"
          }[value]
        }
      },
      {
        label: "用户状态",
        prop: "state", 
        formatter(row, column, value) {
          return {
            1: "在职",
            2: "离职",
            3: "普通用户"
          }[value]
        }
      },
      {
        label: "注册时间",
        prop: "createTime", 
        formatter: (row, column, value) => {
          return utils.formateDate(new Date(value));
        },
      },
      {
        label: "最后登录时间",
        prop: "lastLoginTime", 
        formatter: (row, column, value) => {
          return utils.formateDate(new Date(value));
        },
      },
    ])
    // 弹框显示
    const showModal = ref(false)
    // 验证
    const rules = reactive({
      userName:[
        {required:true,message:"请输入用户名",trigger: "blur"}
      ],
      userEmail: [
        { required: true, message: "请输入用户邮箱", trigger: "blur" },
      ],
      mobile: [
        { pattern: /1[3-9]\d{9}/, message: "请输入正确的手机号格式", trigger: "blur"},
      ],
      deptId: [
        { required: true, message: "请输入用户邮箱", trigger: "blur"},
      ],
    })

    // 获取所有角色列表
    const roleList = ref([])
    // 所有部门列表
    const deptList = ref([]);
    // 定义用户操作的行为
    const action = ref('add')

    onMounted(() => {
      getUserLists()
      getRoleAllLists()
      getDeptLists()
    })
    // 获取用户列表
    const getUserLists = async () => {
      getUserList({
        ...user, 
        ...pager
      }).then(res =>{
        const { list, page }  = res
        userList.value = list;
        pager.total = page.total;
      })
    };
    // 查询
    const handleQuery = () => {
      getUserLists();
    }
    // 重置
    const handleReset = (form) =>{
      ctx.$refs[form].resetFields();
    }
    // 分页处理
    const handleCurrentChange = (current) => {
      pager.pageNum = current
      getUserLists()
    }
    // 删除单个
    const handleDel = (row) => {
      userDel({
        userIds: [row.userId]
      }).then(res => {
        ElMessage.success("删除成功");
        getUserLists()
      })
    }

    // 批量删除
    const handlePatchDel = () => {
      if (checkedUserIds.value.length == 0) {
        ElMessage.success("请选择要删除的用户");
        return
      }

      userDel({
        userIds: checkedUserIds.value
      }).then(res => {
        console.log(res);
        if (res.nModified > 0) {
          ElMessage.success("删除成功");
          getUserLists()
        } else {
          ElMessage.success("删除失败");
        }
      })

    }
    // 表格多选
    const handleSelectionChange = (list) => {
      let arr = []
      list.map(item => {
        arr.push(item.userId)
      })
      checkedUserIds.value = arr
    }

    // 用户新增
    const handleCreate = () => {
      action.value = 'add'
      showModal.value = true
    }

    // 取消弹框
    const handleClose = () => {
      showModal.value = false
      handleReset('dialogForm')
    }

    // 新增弹框内容
    const handleSubmit = () => {
      ctx.$refs.dialogForm.validate((valid) => {
        if(valid) {
          //toRaw把响应式对象转换为普通对象
          let params = toRaw(userForm);
          params.userEmail += "@imooc.com";
          params.action = action.value;
          userSubmit(params).then(res=>{
            showModal.value = false;
            ElMessage.success("用户创建成功");
            handleReset("dialogForm");
            getUserLists();
          })
        }
      })
    }
    
    // 编辑
    const handleEdit = (row) =>{
      action.value = "edit";
      showModal.value = true;
      ctx.$nextTick(() => {
        Object.assign(userForm, row);
      });
    }

    // 部门列表
    const getDeptLists = () => {
      getDeptList().then(res => {
        deptList.value = res
      })
    }

    // 获取角色列表
    const getRoleAllLists = () =>{
      getRoleAllList().then(res =>{
        roleList.value = res
      })
    }

    return {
      user,
      userForm,
      userList,
      columns,
      pager,
      checkedUserIds,
      rules,
      showModal,
      deptList,
      roleList,
      action,
      getUserLists,
      handleQuery,
      handleReset,
      handleCurrentChange,
      handleDel,
      handlePatchDel,
      handleSelectionChange,
      handleCreate,
      handleClose,
      handleSubmit,
      handleEdit,
      getDeptLists,
      getRoleAllLists
    }
  }
}
</script>

<style lang="scss" scoped>

</style>