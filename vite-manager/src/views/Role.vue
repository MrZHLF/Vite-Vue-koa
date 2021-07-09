<template>
  <div class="role-manage">
    <div class="query-form">
      <el-form ref="form" :inline="true" :model="queryForm">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="queryForm.userId" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="getMenuList">查询</el-button>
          <el-button @click="handleReset('form')">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="base-table">
      <div class="action">
        <el-button type="primary" @click="handleAdd">创建</el-button>
      </div>
      <el-table :data="roleList">
        <el-table-column 
          v-for="item in columns" 
          :key="item.prop"
          :label="item.label"
          :prop="item.prop"
          :width="item.width"
          :formatter="item.formatter"
        >
        </el-table-column>
        <el-table-column label="操作" width="300">
          <template #default="scope">
            <el-button size="mini" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="mini" type="primary" @click="handleOpenPermission(scope.row)">设置权限</el-button>
            <el-button
              type="danger"
              size="mini"
              @click="handleDel(scope.row._id)"
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
    
    <el-dialog title="创建用户" v-model="showModal">
      <el-form
        ref="dialogForm"
        :model="roleForm"
        label-width="100px"
        :rules="rules"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="roleForm.roleName" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input
            type="textarea"
            :rows="2"
            v-model="roleForm.remark"
            placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleClose">取 消</el-button>
          <el-button type="primary" @click="handleSubmit">确 定</el-button>
        </span>
      </template>
    </el-dialog> 

    <el-dialog title="权限弹框" v-model="showPermission">
      <el-form label-width="100px">
        <el-form-item label="角色名称">{{curRoleName}}</el-form-item>
        <el-form-item label="选择权限">
          <el-tree 
            ref="tree"
            :data="menuList"
            show-checkbox
            node-key="_id"
            default-expand-all
            :props="{ label: 'menuName' }"
          >
          </el-tree>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showPermission = false">取 消</el-button>
          <el-button type="primary" @click="handlePermissionSubmit"
            >确 定</el-button
          >
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import utils from './../utils/utils' 
export default {
  name:"Role",
  data() {
    return {
      showModal:false,
      showPermission:false, //权限展示
      curRoleName:"",
      curRoleId: "",
      roleList:[],
      menuList:[], //权限列表
      queryForm:{
        roleName: "",
      },
      roleForm:{},
      action: "create",
      pager:{
        total:0,
        pageNum:1,
        pageSize:10
      },
      columns:[
        {
          label: "角色名称",
          prop: "roleName",
        },
        {
          label: "备注",
          prop: "remark",
        },
        {
          label: "权限列表",
          prop: "permissionList",
          width: 200
        },
        {
          label: "创建时间",
          prop: "createTime",
          formatter(row, column, value) {
            return utils.formateDate(new Date(value));
          },
        },
      ],
      rules:{
        roleName: [{required: true,message: "请输入角色角色名称"}],
      }
    }
  },
  mounted() {
    this.getRoleList()
    this.getMenuList()
  },
  methods: {
    // 菜单列表初始化
    async getMenuList() {
      let list = await this.$api.getMenuList();
      this.menuList = list;
    },
    async getRoleList() {
      let {list,page} = await this.$api.getRoleList(this.queryForm)
      this.roleList = list
      this.pager.total = page.total
    },
    handleCurrentChange(current){
      this.pager.pageNum = current
      this.getRoleList()
    },
    // 表单重置
    handleReset(form) {
      this.$refs[form].resetFields();
    },
    // 弹框隐藏
    handleClose() {
      this.handleReset('dialogForm')
      this.showModal = false;
    },
    // 角色编辑
    handleEdit(row){
      this.action = "edit"
      this.showModal = true
      this.$nextTick(() =>{
        Object.assign(this.roleForm,row)
      })
    },
    // 新增
    handleAdd() {
      this.action = "create"
      this.showModal = true
    },
    // 角色删除
    async handleDel(_id) {
      await this.$api.roleOperate({_id,action:"delete"})
      this.$message.success("创建成功")
      this.getRoleList()
    },
    // 角色提交
    handleSubmit(){
      this.$refs.dialogForm.validate( async valid => {
        if(valid) {
          let { roleForm, action } = this
          let params = {...roleForm,action }
          let res = await this.$api.roleOperate(params)
          if (res) {
            this.showModal = false
            this.$message.success("创建成功")
            this.handleReset('dialogForm')
            this.getRoleList()
          }
        }
      })
    },
    handleOpenPermission(row) {
      // 设置权限
      this.curRoleId = row._id
      this.curRoleName = row.roleName
      this.showPermission = true
    },
    // // 权限提交
    handlePermissionSubmit() {

    }
  },
}
</script>

<style lang="scss" scoped>

</style>