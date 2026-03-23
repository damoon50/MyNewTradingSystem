<template>
  <div class="auth-page">
    <div class="auth-page__viewport" id="loginBackground">
      <v-card
        class="loginCard auth-card-surface mx-auto"
        data-testid="auth-card"
        elevation="4"
      >
        <div class="auth-card__panel">
          <section class="auth-hero" aria-label="登录导览">
            <div class="auth-hero__brand">
              <div class="auth-hero__brand-mark" aria-hidden="true">
                <span class="auth-hero__brand-code">TS</span>
              </div>
              <div class="auth-hero__brand-copy">
                <span class="auth-hero__eyebrow">Trading System</span>
                <strong class="auth-hero__heading">Secure access portal</strong>
              </div>
            </div>

            <div class="auth-hero__summary">
              <div>
                <div class="auth-copy__eyebrow">Sign in</div>
                <h1 class="auth-copy__title" data-testid="auth-title">登录</h1>
              </div>
              <p class="auth-copy__subtitle grey--text">使用您的账户名和密码来登录系统</p>
              <p class="auth-copy__detail">
                登录后将继续进入当前角色的交易工作台，并保持既有路由与权限流程不变。
              </p>
            </div>

            <div class="auth-hero__metrics" aria-hidden="true">
              <div class="auth-meta">
                <span class="auth-meta__label">Access lane</span>
                <span class="auth-meta__value">Role-aware routing</span>
              </div>
              <div class="auth-meta">
                <span class="auth-meta__label">Session</span>
                <span class="auth-meta__value">Token protected</span>
              </div>
            </div>
          </section>

          <v-form
            v-model="valid"
            ref="loginForm"
            lazy-validation
            class="auth-form"
            data-testid="auth-form"
          >
            <div class="auth-form__signals" aria-hidden="true">
              <span class="auth-signal auth-signal--primary">可信会话入口</span>
              <span class="auth-signal">登录后自动拉取身份信息</span>
            </div>

            <div class="auth-form__stack">
              <v-text-field
                v-model="user.account"
                :rules="rules.basicRules"
                label="用户名"
                class="rounded-lg"
                hide-details
                rounded
                filled
                single-line
              ></v-text-field>

              <v-text-field
                v-model="user.password"
                :rules="rules.basicRules"
                label="密码"
                class="rounded-lg"
                hide-details
                rounded
                filled
                single-line
                type="password"
              ></v-text-field>
            </div>

            <div class="auth-form__actions">
              <v-btn
                block
                color="primary"
                depressed
                class="rounded-lg"
                data-testid="auth-primary-cta"
                @click="submit"
              >
                <v-icon>mdi-login-variant</v-icon>
                <span>登录</span>
              </v-btn>
              <v-btn
                block
                outlined
                depressed
                class="rounded-lg"
                data-testid="auth-secondary-cta"
                @click="resetForm"
              >
                <v-icon>mdi-account-plus</v-icon>
                <span>注册</span>
              </v-btn>
            </div>

            <div class="auth-form__footer">
              <p class="auth-form__footnote">
                仅保留当前登录字段、验证规则与跳转逻辑，界面更新不会改动认证载荷。
              </p>
            </div>
          </v-form>
        </div>
      </v-card>
    </div>
  </div>
</template>

<script>
export default {
  name: "Login",
  components: {},
  data: () => ({
    valid: false,
    rememberMe: false,
    user: {
      account: "",
      password: "",
    },
    rules: {
      basicRules: [(v) => !!v || "Req uired"],
    },
    isAlertSeen: false,
    alertMessage: "",
    alertDialog: false,
  }),
  methods: {
    async submit() {
      if (this.$refs.loginForm.validate()) {
        await this.$store.dispatch("user/userLogin", this.user);
        await this.$store.dispatch("user/getInfo");
        await this.$store.dispatch(
          "user/generatePermittedRouteList",
          this.$store.state.user.role
        );
        this.$router.push({ path: "/" }).catch(err => (console.log(err)));
      }
    },
    resetForm() {
      this.$router.push({path: "/register"}).catch(err => (console.log(err)));
    },
  },
};
</script>

<style scoped>
</style>
