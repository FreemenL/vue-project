<template>
  <div :class="`${$style['login_page']} fillcontain`">
    <transition
      name="form-fade"
      mode="in-out"
    >
      <section :class="$style['form_contianer']">
        <div :class="$style['manage_tip']">
          <p>
            elm后台管理系统
          </p>
        </div>
        <el-form
          :model="loginForm"
          ref="loginForm"
          :rules="rules"
        >
          <el-form-item prop="username">
            <el-input
              v-model="loginForm.username"
              placeholder="用户名"
            />
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              type="password"
              placeholder="密码"
              v-model="loginForm.password"
            />
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              @click="submitForm('loginForm')"
              :class="$style['submit_btn']"
            >
              登陆
            </el-button>
          </el-form-item>
        </el-form>
        <p :class="$style['tip']">
          温馨提示：
        </p>
        <p :class="$style['tip']">
          未登录过的新用户，自动注册
        </p>
        <p :class="$style['tip']">
          注册过的用户可凭账号密码登录
        </p>
      </section>
    </transition>
  </div>
</template>


<script>

	export default {
	    data(){
			return {
				loginForm: {
					username: '',
					password: '',
				},
				rules: {
					username: [
			      { required: true, message: '请输入用户名', trigger: 'blur' },
			    ],
					password: [
						{ required: true, message: '请输入密码', trigger: 'blur' }
					],
				},
				showLogin: false,
			}
		},
		mounted(){

		},
		methods: {
			submitForm(formName) {
        console.log(formName)
				this.$refs[formName].validate(async (valid) => {
					if (valid) {
							this.$message({
                  type: 'success',
                  message: '登录成功'
              });
							this.$router.push('manage')
					} else {
						this.$notify.error({
							title: '错误',
							message: '请输入正确的用户名密码',
							offset: 100
						});
						return false;
					}
				});
			},
		},
		watch: {
			adminInfo: function (newValue){
				if (newValue.id) {
					this.$message({
              type: 'success',
              message: '检测到您之前登录过，将自动登录'
          });
					this.$router.push('manage')
				}
			}
		}
	}
</script>

<style lang="less" module>
@import '../../style/mixin.less';
:local {
  .login_page {
    background-color: #324057;
  }
  .manage_tip {
    position: absolute;
    width: 100%;
    top: -100px;
    left: 0;
    p {
      font-size: 34px;
      color: #fff;
    }
  }
  .form_contianer {
    .wh(320px, 210px);
    .ctp(320px, 210px);
    padding: 25px;
    border-radius: 5px;
    text-align: center;
    background-color: #fff;
    .submit_btn {
      width: 100%;
      font-size: 16px;
    }
  }
  .tip {
    font-size: 12px;
    color: red;
  }
  .form-fade-enter-active,
  .form-fade-leave-active {
    transition: all 1s;
  }
  .form-fade-enter,
  .form-fade-leave-active {
    transform: translate3d(0, -50px, 0);
    opacity: 0;
  }
}
</style>
