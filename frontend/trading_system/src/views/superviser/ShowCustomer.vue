<template>
  <v-container id="main-view" class="audit-console" data-testid="customer-audit-console">
    <section class="audit-console__hero">
      <div>
        <p class="audit-console__eyebrow text-overline">Superviser ledger / customer</p>
        <h1 class="audit-console__title text-h4">消费者信息总览</h1>
        <p class="audit-console__description text-body-2">
          以审计面板方式并列展示消费者余额、购买频次与最近同步时间，便于快速筛查高频或低余额账户。
        </p>
      </div>

      <div class="audit-console__hero-grid">
        <article class="audit-summary" data-testid="customer-audit-summary-total">
          <span class="audit-summary__label text-caption">样本总数</span>
          <strong class="audit-summary__value text-h5 token-mono" data-ledger="count">{{ customers.length }}</strong>
          <span class="audit-summary__hint text-body-2">监管台账中的消费者账户</span>
        </article>

        <article class="audit-summary" data-testid="customer-audit-summary-priority">
          <span class="audit-summary__label text-caption">余额关注</span>
          <strong class="audit-summary__value text-h5 token-mono" data-ledger="count">{{ flaggedCount }}</strong>
          <span class="audit-summary__hint text-body-2">需要优先复核的账户</span>
        </article>

        <article class="audit-summary" data-testid="customer-audit-summary-updated">
          <span class="audit-summary__label text-caption">最近链上刷新</span>
          <strong class="audit-summary__value text-subtitle-1 token-mono" data-timestamp="customer-latest-update">{{ latestUpdateLabel }}</strong>
          <span class="audit-summary__hint text-body-2">用于交叉确认最新批次</span>
        </article>
      </div>
    </section>

    <section class="audit-console__list" data-testid="customer-audit-list">
      <article
        v-for="(cus, index) in customers"
        :key="recordKey(cus.phone || cus.name, index)"
        class="audit-row"
        data-testid="customer-audit-row"
        :data-audit-key="recordKey(cus.phone || cus.name, index)"
        :data-review-level="reviewLevel(cus)"
      >
        <v-card outlined elevation="0" class="audit-card" data-testid="customer-audit-card">
          <div class="audit-card__body">
            <div class="audit-card__top">
              <div class="audit-card__identity">
                <p class="audit-card__kicker text-caption">消费者档案 #{{ index + 1 }}</p>
                <h2 class="audit-card__title text-h6">{{ cus.name }}</h2>
                <div class="audit-card__meta text-body-2">
                  <span class="audit-card__meta-item token-mono" data-identifier="customer-phone">{{ cus.phone }}</span>
                  <span class="audit-card__meta-item">购买 {{ cus.commodityCount }} 件宝贝</span>
                </div>
              </div>

              <div class="audit-card__signals">
                <span
                  class="audit-chip"
                  :class="`audit-chip--${statusTone(cus.state)}`"
                  data-testid="customer-status-chip"
                  :data-status="cus.state"
                >
                  <v-icon x-small>mdi-account-check-outline</v-icon>
                  <span class="text-body-2">{{ cus.state }}</span>
                </span>

                <span class="audit-chip" :class="`audit-chip--${reviewTone(cus)}`" :data-review-level="reviewLevel(cus)">
                  <v-icon x-small>mdi-shield-search-outline</v-icon>
                  <span class="text-body-2">{{ reviewLabel(cus) }}</span>
                </span>

                <span class="audit-chip audit-chip--timestamp token-mono" data-testid="customer-timestamp" data-timestamp="customer-record-update">
                  <v-icon x-small>mdi-clock-outline</v-icon>
                  <span class="text-body-2">{{ cus.lastupdateTime }}</span>
                </span>
              </div>
            </div>

            <div class="audit-metrics">
              <article class="audit-metric">
                <span class="audit-detail__label text-caption">账户余额</span>
                <strong class="audit-metric__value text-subtitle-1 token-mono" data-ledger="amount">{{ cus.balance }} 元</strong>
              </article>
              <article class="audit-metric">
                <span class="audit-detail__label text-caption">购买件数</span>
                <strong class="audit-metric__value text-subtitle-1 token-mono" data-ledger="count">{{ cus.commodityCount }}</strong>
              </article>
              <article class="audit-metric">
                <span class="audit-detail__label text-caption">联系方式</span>
                <strong class="audit-metric__value text-subtitle-1 token-mono" data-identifier="customer-contact">{{ cus.phone }}</strong>
              </article>
              <article class="audit-metric">
                <span class="audit-detail__label text-caption">监管备注</span>
                <strong class="audit-metric__value text-subtitle-1">{{ reviewHint(cus) }}</strong>
              </article>
            </div>
          </div>

          <v-expand-transition>
            <div v-show="cus.showDetails">
              <v-divider></v-divider>
              <div class="audit-detail-grid">
                <article class="audit-detail">
                  <span class="audit-detail__label text-caption">账户名称</span>
                  <strong class="audit-detail__value text-body-1">{{ cus.name }}</strong>
                </article>
                <article class="audit-detail">
                  <span class="audit-detail__label text-caption">复核等级</span>
                  <strong class="audit-detail__value text-body-1">{{ reviewLabel(cus) }}</strong>
                </article>
                <article class="audit-detail">
                  <span class="audit-detail__label text-caption">账本状态</span>
                  <strong class="audit-detail__value text-body-1">{{ cus.state }}</strong>
                </article>
                <article class="audit-detail">
                  <span class="audit-detail__label text-caption">链上时间戳</span>
                  <strong class="audit-detail__value text-body-1 token-mono">{{ cus.lastupdateTime }}</strong>
                </article>
              </div>
            </div>
          </v-expand-transition>

          <v-card-actions class="audit-card__actions">
            <v-dialog v-model="dialog" persistent max-width="420">
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  text
                  class="audit-action audit-action--danger"
                  data-testid="customer-danger-action"
                  v-bind="attrs"
                  v-on="on"
                >
                  标记危险操作
                </v-btn>
              </template>

              <v-card class="audit-dialog">
                <v-card-title class="audit-dialog__title text-h6">确认执行消费者处置</v-card-title>
                <v-card-text class="audit-dialog__copy text-body-2">
                  名称：{{ cus.name }}<br>
                  电话：{{ cus.phone }}<br>
                  余额：{{ cus.balance }} 元（购买 {{ cus.commodityCount }} 件宝贝）
                </v-card-text>
                <v-card-actions class="audit-dialog__actions">
                  <v-spacer></v-spacer>
                  <v-btn text class="audit-action" @click="dialog = false">保留记录</v-btn>
                  <v-btn text class="audit-action audit-action--danger" @click="UnvalidCus(index)">继续提交</v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>

            <v-spacer></v-spacer>

            <v-btn text class="audit-action audit-card__toggle" @click="cus.showDetails = !cus.showDetails">
              {{ cus.showDetails ? '收起审计字段' : '展开审计字段' }}
              <v-icon right>{{ cus.showDetails ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
            </v-btn>
          </v-card-actions>
        </v-card>
      </article>
    </section>
  </v-container>
</template>

<script>
import ResponseExtractor from "../../utils/response-extractor";
import TimeService from "../../api/time/time";
import GlobalMessage from "../../components/GlobalMsgbar/api";
import UserService from "../../api/auth/user";

export default {
  name: "ShowCustomer",
  computed: {
    flaggedCount() {
      return this.customers.filter((cus) => this.reviewLevel(cus) === "high").length;
    },
    latestUpdateLabel() {
      if (!this.customers.length) {
        return "等待链上回执";
      }
      const latestStamp = Math.max(...this.customers.map((cus) => cus.lastUpdateStamp || 0));
      return TimeService.timesampToTime(latestStamp);
    },
  },
  mounted() {
    this.getCusList();
  },
  methods: {
    UnvalidCus(index) {
      console.log(index);
      GlobalMessage.success("这功能还没做好，等下版本吧");
      this.dialog = false;
    },
    getCusList() {
      UserService.getAllCusInfo().then((resp) => {
        const cusList = ResponseExtractor.getData(resp);
        this.customers = cusList.map((item) => ({
          name: item.name,
          phone: item.phone,
          commodityCount: item.commodityCount,
          balance: item.balance,
          state: "有效的",
          lastUpdateStamp: item.lastUpdateTime,
          lastupdateTime: TimeService.timesampToTime(item.lastUpdateTime),
          showDetails: false,
        }));
      });
    },
    recordKey(value, index) {
      const normalized = String(value || "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      return normalized || `customer-${index}`;
    },
    statusTone(state) {
      return state === "有效的" ? "success" : "warning";
    },
    reviewLevel(cus) {
      const balance = Number(cus.balance) || 0;
      const commodityCount = Number(cus.commodityCount) || 0;
      if (balance <= 1000 || commodityCount >= 10) {
        return "high";
      }
      if (balance <= 3000 || commodityCount >= 5) {
        return "medium";
      }
      return "low";
    },
    reviewTone(cus) {
      const toneMap = {
        high: "warning",
        medium: "primary",
        low: "success",
      };
      return toneMap[this.reviewLevel(cus)];
    },
    reviewLabel(cus) {
      const labelMap = {
        high: "重点审阅",
        medium: "例行复核",
        low: "台账稳定",
      };
      return labelMap[this.reviewLevel(cus)];
    },
    reviewHint(cus) {
      return this.reviewLevel(cus) === "high" ? "关注余额承压或高频购买" : "按周期抽查";
    },
  },
  data() {
    return {
      dialog: false,
      customers: [],
      issuer: "",
    };
  },
};
</script>

<style scoped lang="scss">
@import "./superviser-audit.scss";
</style>
