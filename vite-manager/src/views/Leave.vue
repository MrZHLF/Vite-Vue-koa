<template>
  <div class="user-manage">
    <div class="query-form">
      <el-form ref="form" :inline="true" :model="queryForm">
        <el-form-item label="审批状态" prop="applyState">
          <el-select v-model="queryForm.applyState">
            <el-option value="" label="全部"></el-option>
            <el-option :value="1" label="待审批"></el-option>
            <el-option :value="2" label="审批中"></el-option>
            <el-option :value="3" label="审批拒绝"></el-option>
            <el-option :value="4" label="审批通过"></el-option>
            <el-option :value="5" label="作废"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="getApplyLists">查询</el-button>
          <el-button @click="handleReset('form')">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="base-table">
      <div class="action">
        <el-button type="primary" @click="handleApply">申请休假</el-button>
      </div>
      <el-table :data="applyList">
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
              size="mini" @click="handleDetail(scope.row)">查看</el-button>
            <el-button
              type="danger"
              size="mini"
              @click="handleDelete(scope.row._id)"
              v-if="[1,2].includes(scope.row.applyState)"
              >作废</el-button>
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
    <el-dialog title="申请休假" v-model="showModal" width="50%">
      <el-form ref="dialogForm" :rules="rules" :model="leaveForm" label-width="120px">
        <el-form-item label="休假类型" prop="applyType" required>
          <el-select v-model="leaveForm.applyType">
            <el-option label="事假" :value="1"></el-option>
            <el-option label="调休" :value="2"></el-option>
            <el-option label="年假" :value="3"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="休假时间" required>
          <el-row>
            <el-col :span="8">
              <el-form-item prop="startTime" required>
                <el-date-picker v-model="leaveForm.startTime" type="date" placeholder="选择开始时间" @change="(val) => handleDateChange('startTime',val)"/>
              </el-form-item>
            </el-col>
            <el-col :span="1">-</el-col>
            <el-col :span="8">
              <el-form-item prop="endTime" required>
                <el-date-picker v-model="leaveForm.endTime" type="date" placeholder="选择结束时间"  @change="(val) => handleDateChange('endTime',val)"/>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item label="休假时长">
          {{leaveForm.leaveTime}}
        </el-form-item>
        <el-form-item label="休假原因" prop="reasons" required>
          <el-input type="textarea" :row="3" v-model="leaveForm.reasons" placeholder="请输入休假原因"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleClose">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
    <el-dialog title="申请休假详情" v-model="showDetailModal" width="50%">
      <el-steps :active="detail.applyState > 2 ? 3 : detail.applyState" align-center >
        <el-step title="待审批"></el-step>
        <el-step title="审批中"></el-step>
        <el-step title="审批通过/审批拒绝"></el-step>
      </el-steps>
      <el-form label-width="120px" label-suffix=":">
        <el-form-item label="休假类型">
          <div>{{detail.applyTypeName}}</div>
        </el-form-item>
        <el-form-item label="休假时间">
          <div>{{detail.time}}</div>
        </el-form-item>
        <el-form-item label="休假时长">
          <div>{{detail.leaveTime}}</div>
        </el-form-item>
        <el-form-item label="休假原因">
          <div>{{detail.reasons}}</div>
        </el-form-item>
        <el-form-item label="审批状态">
          <div>{{detail.applyStateName}}</div>
        </el-form-item>
        <el-form-item label="审批人">
          <div>{{detail.curAuditUserName}}</div>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import {getCurrentInstance, onMounted, ref,reactive } from 'vue'
import utils from './../utils/utils'
import { ElMessage } from 'element-plus'
import { getApplyList,leaveOperate } from './../api/index'
export default {
  name:"user",
  setup () {
    //   获取Composition API 上下文对象
    const { ctx } = getCurrentInstance();
    const queryForm = reactive({
      applyState:""
    })
    const pager = reactive({
      pageNum: 1,
      pageSize: 10,
      total: 0,
    });
    const leaveForm = reactive({
      applyType:"",
      startTime:"",
      endTime:"",
      leaveTime:"0天",
      reasons:""
    })
    const showModal = ref(false)
    const applyList = ref([])
    const rules = reactive({
      applyType:[{required:true,message:"请选择休假类型",trigger:"change"}],
      startTime:[{type:"date",required:true,message:"请输入开始日期",trigger:"change"}],
      endTime:[{type:"date",required:true,message:"请输入结束日期",trigger:"change"}],
      reasons:[{required:true,message:"请输入休假原因",trigger:"blur"}]
    })

    const showDetailModal = ref(false)
    const detail = ref({})

    const action = ref('create') //create创建 
    // 定义动态表格格式

    const columns = reactive([
      {
        label: "单号",
        prop: "orderNo",
      },
      {
        label: "休假时间",
        prop: "",
        formatter(row) {
          return (
            utils.formateDate(new Date(row.startTime), "yyyy-MM-dd") +
            "到" +
            utils.formateDate(new Date(row.endTime), "yyyy-MM-dd")
          );
        },
      },
      {
        label: "休假时长",
        prop: "leaveTime",
      },
      {
        label: "休假类型",
        prop: "applyType",
        formatter(row, column, value) {
          return {
            1: "事假",
            2: "调休",
            3: "年假",
          }[value];
        },
      },
      {
        label: "休假原因",
        prop: "reasons",
      },
      {
        label: "申请时间",
        prop: "createTime",
        width: 180,
        formatter: (row, column, value) => {
          return utils.formateDate(new Date(value));
        },
      },
      {
        label: "审批人",
        prop: "auditUsers",
      },
      {
        label: "当前审批人",
        prop: "curAuditUserName",
      },
      {
        label: "审批状态",
        prop: "applyState",
        formatter: (row, column, value) => {
          // 1:待审批 2:审批中 3:审批拒绝 4:审批通过 5:作废
          return {
            1: "待审批",
            2: "审批中",
            3: "审批拒绝",
            4: "审批通过",
            5: "作废",
          }[value];
        },
      },
    ]);

    onMounted(() => {
      getApplyLists()
    });

    // 选择时间处理
    const handleDateChange = (key,val) => {
      let { startTime,endTime } = leaveForm
      if (!startTime || !endTime) return
      if (startTime >endTime) {
        ElMessage.error("开始日期不能大于结束日期")
        leaveForm.leaveTime = "0天"
        setTimeout(() => {
          leaveForm[key] = ""
        },0)
      } else {
        leaveForm.leaveTime = ((endTime - startTime) / (24*60*60*1000)+ 1 ) + "天"
      }
    }

    // 请求接口
    const getApplyLists = async() => {
      let parasm = {...queryForm,...pager}
      getApplyList(parasm).then(res => {
        console.log(res,'56');
        let { list, page } = res
          applyList.value = list
          pager.total = page.total
      })
      
    };
    // 重置
    const handleReset = (form) =>{
      ctx.$refs[form].resetFields();
    }
    // 分页处理
    const handleCurrentChange = (current) => {
      pager.pageNum = current
      getApplyLists()
    }

    
    // 点击申请休假
    const handleApply = () => {
      showModal.value = true
      action.value = "create"
    }
    // 关闭弹窗
    const handleClose = () => {
      showModal.value = false
      handleReset("dialogForm")
    }

    // 提交表单
    const handleSubmit = () => {
      ctx.$refs.dialogForm.validate(async(valid) => {
        if (valid) {
          try {
            let params = {...leaveForm,action:action.value}
            let res = await leaveOperate(params)
            ElMessage.success("创建成功")
            handleClose()
            getApplyLists()
          } catch (error) {
            
          }
        }
      })
    }
    // 查看
    const handleDetail = (row) => {
      let data = {...row}
      data.applyTypeName = {
        1:"事假",
        2:"调休",
        3:"年假"
      }[data.applyType]

      data.time = utils.formateDate(new Date(row.startTime), "yyyy-MM-dd") +
            "到" +
            utils.formateDate(new Date(row.endTime), "yyyy-MM-dd")
      data.applyStateName = {
        1:"待审批",
        2:"审批中",
        3:"审批拒绝",
        4:"审批通过",
        5:"作废",
      }[data.applyState]
      detail.value = data
      showDetailModal.value = true
    }

    // 作废
    const handleDelete= async (_id) => {
      let params = {_id, action:"delete"}
      let res = await leaveOperate(params)
      ElMessage.success("删除成功")
      getApplyLists()
    }

    return {
      queryForm,
      columns,
      applyList,
      pager,
      leaveForm,
      showModal,
      rules,
      showDetailModal,
      detail,
      handleCurrentChange,
      handleReset,
      getApplyLists,
      handleDetail,
      handleApply,
      handleClose,
      handleSubmit,
      handleDateChange,
      handleDelete
    }
  }
}
</script>

<style lang="scss" scoped>

</style>