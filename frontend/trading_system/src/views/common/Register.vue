<template>
  <div class="auth-page">
    <div class="auth-page__viewport" id="loginBackground">
      <v-card
        class="loginCard auth-card-surface mx-auto"
        data-testid="auth-card"
        elevation="4"
      >
        <div class="auth-card__panel">
          <section class="auth-hero" aria-label="注册导览">
            <div class="auth-hero__brand">
              <div class="auth-hero__brand-mark" aria-hidden="true">
                <span class="auth-hero__brand-code">TS</span>
              </div>
              <div class="auth-hero__brand-copy">
                <span class="auth-hero__eyebrow">Trading System</span>
                <strong class="auth-hero__heading">Account onboarding</strong>
              </div>
            </div>

            <div class="auth-hero__summary">
              <div>
                <div class="auth-copy__eyebrow">Create account</div>
                <h1 class="auth-copy__title" data-testid="auth-title">注册</h1>
              </div>
              <p class="auth-copy__subtitle grey--text">请注册您的TS账户</p>
              <p class="auth-copy__detail">
                选择身份后提交当前注册请求，成功提示后仍按现有流程返回登录页面继续进入系统。
              </p>
            </div>

            <div class="auth-hero__metrics" aria-hidden="true">
              <div class="auth-meta">
                <span class="auth-meta__label">Identity</span>
                <span class="auth-meta__value">角色分流</span>
              </div>
              <div class="auth-meta">
                <span class="auth-meta__label">Flow</span>
                <span class="auth-meta__value">注册后回到登录</span>
              </div>
            </div>
          </section>

          <v-form
            v-model="valid"
            ref="registerFrom"
            lazy-validation
            class="auth-form"
            data-testid="auth-form"
          >
            <div class="auth-form__signals" aria-hidden="true">
              <span class="auth-signal auth-signal--primary">身份验证入口</span>
              <span class="auth-signal">保持既有注册请求载荷</span>
            </div>

            <div class="auth-form__stack">
              <v-text-field
                v-model="userRegister.name"
                :rules="rules.basicRules"
                label="请输入姓名"
                class="rounded-lg"
                hide-details
                rounded
                filled
                single-line
              ></v-text-field>

              <v-text-field
                v-model="userRegister.account"
                :rules="rules.basicRules"
                label="请输入手机号"
                class="rounded-lg"
                hide-details
                rounded
                filled
                single-line
              ></v-text-field>

              <v-text-field
                v-model="userRegister.password"
                :rules="rules.basicRules"
                label="请输入密码"
                class="rounded-lg"
                hide-details
                rounded
                filled
                single-line
                type="password"
              ></v-text-field>

              <v-select
                :options="roleItems"
                :items="roleItems"
                v-model="userRegister.role"
                item-text="value"
                item-value="id"
                label="请选择身份"
                data-testid="auth-role-select"
                filled
              ></v-select>
            </div>

            <div class="auth-form__actions">
              <v-btn
                block
                color="primary"
                depressed
                class="rounded-lg"
                data-testid="auth-primary-cta"
                @click="register"
              >
                <v-icon>mdi-account-plus</v-icon>
                <span>注册</span>
              </v-btn>
              <v-btn
                block
                outlined
                depressed
                class="rounded-lg"
                data-testid="auth-secondary-cta"
                @click="getToLogin"
              >
                <v-icon>mdi-login-variant</v-icon>
                <span>登录</span>
              </v-btn>
            </div>

            <div class="auth-form__footer">
              <p class="auth-form__footnote">
                轻量安全提示仅用于说明流程，注册字段、验证行为与登录跳转目标保持不变。
              </p>
            </div>
          </v-form>
        </div>
      </v-card>
    </div>
  </div>
</template>

<script>
import GlobalMessage from "../../components/GlobalMsgbar/api";
import UserService from "../../api/auth/user";
import ResponseExtractor from "../../utils/response-extractor";

export default {
  name: "Login",
  components: {},
  data: () => ({
    valid: false,
    rememberMe: false,
    userRegister: {
      name :"",
      account: "",
      password: "",
      role: 0
    },
    rules: {
      basicRules: [(v) => !!v || "Req uired"],
    },
    isAlertSeen: false,
    alertMessage: "",
    alertDialog: false,
    roleItems :[
      {
        "id":1,
        "value": "监管人员"
      },
      {
        "id":2,
        "value": "商家"
      },
      {
        "id":3,
        "value": "消费者"
      },

    ]
  }),
  methods: {

    getToLogin(){
      // 返回登录界面
      this.$router.push({path: "/login"}).catch(err => (console.log(err)))
    },
    async register() {
      // 注册
      if (this.$refs.registerFrom.validate()){
        console.log("this.userRegister :",this.userRegister.name)
        UserService.register(this.userRegister).then((resp) => {
          const data = ResponseExtractor.getData(resp);
          GlobalMessage.success("注册申请已提交，请耐心等待")
          console.log("register response result", data);
          this.$router.push({ path :"/login"}).catch(err => console.log(err));
        })
        .catch((error) => {
          console.log("register failed", error);
          const msg = error?.message || "注册失败，请检查后端是否启动";
          GlobalMessage.error(msg);
        })

      }
    },
    async submit() {
      if (this.$refs.registerFrom.validate()) {
        await this.$store.dispatch("user/userLogin", this.user);
        await this.$store.dispatch("user/getInfo", this.user);
        await this.$store.dispatch(
            "user/generatePermittedRouteList",
            this.$store.state.user.role
        );
        this.$router.push({ path: "/" }).catch(err => (console.log(err)));
      }
    },


  },
};
</script>

<style scoped>
</style>
