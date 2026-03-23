<template>
  <v-container id="main-view" class="audit-console" data-testid="business-audit-console">
    <section class="audit-console__hero">
      <div>
        <p class="audit-console__eyebrow text-overline">Superviser ledger / business</p>
        <h1 class="audit-console__title text-h4">商家信息总览</h1>
        <p class="audit-console__description text-body-2">
          以更高信息密度聚合商家台账、联系方式与链上更新时间，便于监管侧快速复核异常盈利与活跃度。
        </p>
      </div>

      <div class="audit-console__hero-grid">
        <article class="audit-summary" data-testid="business-audit-summary-total">
          <span class="audit-summary__label text-caption">样本总数</span>
          <strong class="audit-summary__value text-h5 token-mono" data-ledger="count">{{ business.length }}</strong>
          <span class="audit-summary__hint text-body-2">监管台账中的商家账户</span>
        </article>

        <article class="audit-summary" data-testid="business-audit-summary-priority">
          <span class="audit-summary__label text-caption">重点审阅</span>
          <strong class="audit-summary__value text-h5 token-mono" data-ledger="count">{{ priorityCount }}</strong>
          <span class="audit-summary__hint text-body-2">高盈利或高流转账户</span>
        </article>

        <article class="audit-summary" data-testid="business-audit-summary-updated">
          <span class="audit-summary__label text-caption">最近链上刷新</span>
          <strong class="audit-summary__value text-subtitle-1 token-mono" data-timestamp="business-latest-update">{{ latestUpdateLabel }}</strong>
          <span class="audit-summary__hint text-body-2">用于对照最新同步批次</span>
        </article>
      </div>
    </section>

    <section class="audit-console__list" data-testid="business-audit-list">
      <article
        v-for="(bus, index) in business"
        :key="recordKey(bus.phone || bus.name, index)"
        class="audit-row"
        data-testid="business-audit-row"
        :data-audit-key="recordKey(bus.phone || bus.name, index)"
        :data-review-level="reviewLevel(bus)"
      >
        <v-card outlined elevation="0" class="audit-card" data-testid="business-audit-card">
          <div class="audit-card__body">
            <div class="audit-card__top">
              <div class="audit-card__identity">
                <p class="audit-card__kicker text-caption">商家档案 #{{ index + 1 }}</p>
                <h2 class="audit-card__title text-h6">{{ bus.name }}</h2>
                <div class="audit-card__meta text-body-2">
                  <span class="audit-card__meta-item token-mono" data-identifier="business-phone">{{ bus.phone }}</span>
                  <span class="audit-card__meta-item">卖出 {{ bus.commodityCount }} 件宝贝</span>
                </div>
              </div>

              <div class="audit-card__signals">
                <span
                  class="audit-chip"
                  :class="`audit-chip--${statusTone(bus.state)}`"
                  data-testid="business-status-chip"
                  :data-status="bus.state"
                >
                  <v-icon x-small>mdi-shield-check</v-icon>
                  <span class="text-body-2">{{ bus.state }}</span>
                </span>

                <span class="audit-chip" :class="`audit-chip--${reviewTone(bus)}`" :data-review-level="reviewLevel(bus)">
                  <v-icon x-small>mdi-clipboard-search-outline</v-icon>
                  <span class="text-body-2">{{ reviewLabel(bus) }}</span>
                </span>

                <span class="audit-chip audit-chip--timestamp token-mono" data-testid="business-timestamp" data-timestamp="business-record-update">
                  <v-icon x-small>mdi-clock-outline</v-icon>
                  <span class="text-body-2">{{ bus.lastupdateTime }}</span>
                </span>
              </div>
            </div>

            <div class="audit-metrics">
              <article class="audit-metric">
                <span class="audit-detail__label text-caption">总盈利</span>
                <strong class="audit-metric__value text-subtitle-1 token-mono" data-ledger="amount">{{ bus.balance }} 元</strong>
              </article>
              <article class="audit-metric">
                <span class="audit-detail__label text-caption">卖出件数</span>
                <strong class="audit-metric__value text-subtitle-1 token-mono" data-ledger="count">{{ bus.commodityCount }}</strong>
              </article>
              <article class="audit-metric">
                <span class="audit-detail__label text-caption">联系方式</span>
                <strong class="audit-metric__value text-subtitle-1 token-mono" data-identifier="business-contact">{{ bus.phone }}</strong>
              </article>
              <article class="audit-metric">
                <span class="audit-detail__label text-caption">监管备注</span>
                <strong class="audit-metric__value text-subtitle-1">{{ reviewHint(bus) }}</strong>
              </article>
            </div>
          </div>

          <v-expand-transition>
            <div v-show="bus.showDetails">
              <v-divider></v-divider>
              <div class="audit-detail-grid">
                <article class="audit-detail">
                  <span class="audit-detail__label text-caption">账户名称</span>
                  <strong class="audit-detail__value text-body-1">{{ bus.name }}</strong>
                </article>
                <article class="audit-detail">
                  <span class="audit-detail__label text-caption">复核等级</span>
                  <strong class="audit-detail__value text-body-1">{{ reviewLabel(bus) }}</strong>
                </article>
                <article class="audit-detail">
                  <span class="audit-detail__label text-caption">账本状态</span>
                  <strong class="audit-detail__value text-body-1">{{ bus.state }}</strong>
                </article>
                <article class="audit-detail">
                  <span class="audit-detail__label text-caption">链上时间戳</span>
                  <strong class="audit-detail__value text-body-1 token-mono">{{ bus.lastupdateTime }}</strong>
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
                  data-testid="business-danger-action"
                  v-bind="attrs"
                  v-on="on"
                >
                  标记危险操作
                </v-btn>
              </template>

              <v-card class="audit-dialog">
                <v-card-title class="audit-dialog__title text-h6">确认执行商家处置</v-card-title>
                <v-card-text class="audit-dialog__copy text-body-2">
                  名称：{{ bus.name }}<br>
                  电话：{{ bus.phone }}<br>
                  总盈利：{{ bus.balance }} 元（卖出 {{ bus.commodityCount }} 件宝贝）
                </v-card-text>
                <v-card-actions class="audit-dialog__actions">
                  <v-spacer></v-spacer>
                  <v-btn text class="audit-action" @click="dialog = false">保留记录</v-btn>
                  <v-btn text class="audit-action audit-action--danger" @click="UnvalidBus(index)">继续提交</v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>

            <v-spacer></v-spacer>

            <v-btn text class="audit-action audit-card__toggle" @click="bus.showDetails = !bus.showDetails">
              {{ bus.showDetails ? '收起审计字段' : '展开审计字段' }}
              <v-icon right>{{ bus.showDetails ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
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
  name: "ShowBussiness",
  computed: {
    priorityCount() {
      return this.business.filter((bus) => this.reviewLevel(bus) === "high").length;
    },
    latestUpdateLabel() {
      if (!this.business.length) {
        return "等待链上回执";
      }
      const latestStamp = Math.max(...this.business.map((bus) => bus.lastUpdateStamp || 0));
      return TimeService.timesampToTime(latestStamp);
    },
  },
  mounted() {
    this.getBusList();
  },
  methods: {
    UnvalidBus(index) {
      console.log(index);
      GlobalMessage.success("这功能还没做好，等下版本吧");
      this.dialog = false;
    },
    getBusList() {
      UserService.getAllBusInfo().then((resp) => {
        const busList = ResponseExtractor.getData(resp);
        this.business = busList.map((item) => ({
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
      return normalized || `business-${index}`;
    },
    statusTone(state) {
      return state === "有效的" ? "success" : "warning";
    },
    reviewLevel(bus) {
      const balance = Number(bus.balance) || 0;
      const commodityCount = Number(bus.commodityCount) || 0;
      if (balance >= 5000 || commodityCount >= 10) {
        return "high";
      }
      if (balance >= 1000 || commodityCount >= 5) {
        return "medium";
      }
      return "low";
    },
    reviewTone(bus) {
      const toneMap = {
        high: "warning",
        medium: "primary",
        low: "success",
      };
      return toneMap[this.reviewLevel(bus)];
    },
    reviewLabel(bus) {
      const labelMap = {
        high: "重点审阅",
        medium: "例行复核",
        low: "台账稳定",
      };
      return labelMap[this.reviewLevel(bus)];
    },
    reviewHint(bus) {
      return this.reviewLevel(bus) === "high" ? "关注盈利峰值与出货速度" : "按周期抽查";
    },
  },
  data() {
    return {
      dialog: false,
      business: [],
      issuer: "",
    };
  },
};
</script>

<style scoped lang="scss">
@import "./superviser-audit.scss";
</style>
