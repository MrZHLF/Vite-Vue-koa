<template>
  <div class="login-wrapper">
    <div class="modal">
      <el-form ref="userForm" :model="user" label-width="80px" status-icon :rules="rules">
        <div class="title">后台管理系统</div>
        <el-form-item label="用户名" prop="userName">
          <el-input type="text" v-model="user.userName" prefix-icon="el-icon-user"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="userPwd">
          <el-input type="password" v-model="user.userPwd" prefix-icon="el-icon-view"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button class="btn-login" type="primary" @click="login">登录</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        user:{
          userName: "admin",
          userPwd: "123456",
        },
        rules:{
          userName: [
            {
              required: true,
              message: "请输入用户名",
              trigger: "blur",
            },
          ],
          userPwd: [
            {
              required: true,
              message: "请输入密码",
              trigger: "blur",
            },
          ],
        }
      }
    },
    methods: {
      login() {
        this.$refs.userForm.validate((valid) => {
          if(valid) {
            this.$api.login(this.user).then(res => {
              console.log(res,'441515');
              this.$store.commit('saveUserInfo',res)
              this.$router.push('/welcome')
            })
          }
        })
      }
    },
  }
</script>

<style lang="scss">
.login-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f9fcff;
  width: 100vw;
  height: 100vh;
  .modal {
    width: 500px;
    padding: 50px;
    background-color: #fff;
    border-radius: 4px;
    box-shadow: 0px 0px 10px 3px #c7c9cb4d;
    .title {
      font-size: 26px;
      line-height: 1.5;
      text-align: center;
      margin-bottom: 30px;
    }
    .btn-login {
      width: 100%;
    }
  }
}
</style>
