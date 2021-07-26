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
              size="mini" 
              @click="handleDetail(scope.row)"
              v-if="scope.row.curAuditUserName == userInfo.userName && [1,2].includes(scope.row.applyState)"
            >审核</el-button>
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
    <el-dialog title="审核" v-model="showDetailModal" width="50%">
      
      <el-form ref="dialogForm" :rules="rules" :model="auditForm" label-width="120px" label-suffix=":">
        <el-form-item label="申请人">
          <div>{{detail.applyUser.userName}}</div>
        </el-form-item>
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
        <el-form-item label="备注" prop="remark">
          <el-input type="textarea" :rows="3"  placeholder="请输入审核备注" v-model="auditForm.remark"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleApprove('pass')">审核通过</el-button>
          <el-button @click="handleApprove('refuse')" type="primary">驳回</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import {getCurrentInstance, onMounted, ref,reactive } from 'vue'
import { useStore } from 'vuex'
import utils from '../utils/utils'
import { ElMessage } from 'element-plus'
import { getApplyList,leaveApprove } from '../api/index'
export default {
  name:"approve",
  setup () {
    //   获取Composition API 上下文对象
    const { ctx } = getCurrentInstance();
    const queryForm = reactive({
      applyState:1
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
    const applyList = ref([])

    const showDetailModal = ref(false)
    const detail = ref({})
    const Store = useStore()
    const userInfo = Store.state.userInfo
    // 定义动态表格格式

    const columns = reactive([
      {
        label: "单号",
        prop: "orderNo",
      },
      {
        label: "申请人",
        prop: "",
        formatter(row){
          return row.applyUser.userName
        }
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

    const auditForm = reactive({
      remark:""
    })

    const rules = {
      remark:[{required:true,message:"请输入审核备注",trigger:"change"}]
    }

    onMounted(() => {
      getApplyLists()
    });


    // 请求接口
    const getApplyLists = async() => {
      let parasm = {...queryForm,...pager,type: "approve"}
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
    
    const handleClose = () => {
      showDetailModal.value = false
      handleReset("dialogForm")
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

    const handleApprove = (action) => {
      ctx.$refs.dialogForm.validate(async (valid) => {
        if (valid) {
          let params = { action,remark: auditForm.remark, _id: detail.value._id }
          try {
              await leaveApprove(params)
              handleClose()
              ElMessage.success("处理成功")
              getApplyLists()
              Store.commit("saveNoticeCount",Store.state.noticeCount.length - 1)
          } catch (error) {
            
          }
        }
      })
    }

    return {
      queryForm,
      columns,
      applyList,
      pager,
      leaveForm,
      showDetailModal,
      detail,
      userInfo,
      auditForm,
      rules,
      handleCurrentChange,
      handleReset,
      getApplyLists,
      handleDetail,
      handleApprove
    }
  }
}
</script>

<style lang="scss" scoped>

</style>