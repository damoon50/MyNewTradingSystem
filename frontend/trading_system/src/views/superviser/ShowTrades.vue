<template>
  <v-container id="main-view" class="audit-console" data-testid="trade-audit-console">
    <section class="audit-console__hero">
      <div>
        <p class="audit-console__eyebrow text-overline">Superviser ledger / trade</p>
        <h1 class="audit-console__title text-h4">交易信息总览</h1>
        <p class="audit-console__description text-body-2">
          用更紧凑的交易流水卡片突出金额、买卖双方与最新回写时间，便于监管侧识别高额成交与复核优先级。
        </p>
      </div>

      <div class="audit-console__hero-grid">
        <article class="audit-summary" data-testid="trade-audit-summary-total">
          <span class="audit-summary__label text-caption">流水总数</span>
          <strong class="audit-summary__value text-h5 token-mono" data-ledger="count">{{ trades.length }}</strong>
          <span class="audit-summary__hint text-body-2">当前监管视图中的成交记录</span>
        </article>

        <article class="audit-summary" data-testid="trade-audit-summary-priority">
          <span class="audit-summary__label text-caption">高额复核</span>
          <strong class="audit-summary__value text-h5 token-mono" data-ledger="count">{{ flaggedCount }}</strong>
          <span class="audit-summary__hint text-body-2">建议优先复核的流水</span>
        </article>

        <article class="audit-summary" data-testid="trade-audit-summary-updated">
          <span class="audit-summary__label text-caption">最近链上刷新</span>
          <strong class="audit-summary__value text-subtitle-1 token-mono" data-timestamp="trade-latest-update">{{ latestUpdateLabel }}</strong>
          <span class="audit-summary__hint text-body-2">用于对照最新结算批次</span>
        </article>
      </div>
    </section>

    <section class="audit-console__list" data-testid="trade-audit-list">
      <article
        v-for="(tra, index) in trades"
        :key="recordKey(tra.id, index)"
        class="audit-row"
        data-testid="trade-audit-row"
        :data-audit-key="recordKey(tra.id, index)"
        :data-review-level="reviewLevel(tra)"
      >
        <v-card outlined elevation="0" class="audit-card" data-testid="trade-audit-card">
          <div class="audit-card__body">
            <div class="audit-card__top">
              <div class="audit-card__identity">
                <p class="audit-card__kicker text-caption">交易流水 #{{ index + 1 }}</p>
                <h2 class="audit-card__title text-h6">交易编号 {{ tra.id }}</h2>
                <div class="audit-card__meta text-body-2">
                  <span class="audit-card__meta-item token-mono" data-ledger="amount">{{ tra.price }} RMB</span>
                  <span class="audit-card__meta-item token-mono" data-timestamp="trade-time">{{ tra.time }}</span>
                </div>
              </div>

              <div class="audit-card__signals">
                <span
                  class="audit-chip"
                  :class="`audit-chip--${statusTone(tra.state)}`"
                  data-testid="trade-status-chip"
                  :data-status="tra.state"
                >
                  <v-icon x-small>mdi-swap-horizontal-bold</v-icon>
                  <span class="text-body-2">{{ tra.state }}</span>
                </span>

                <span class="audit-chip" :class="`audit-chip--${reviewTone(tra)}`" :data-review-level="reviewLevel(tra)">
                  <v-icon x-small>mdi-finance</v-icon>
                  <span class="text-body-2">{{ reviewLabel(tra) }}</span>
                </span>

                <span class="audit-chip audit-chip--timestamp token-mono" data-testid="trade-timestamp" data-timestamp="trade-record-update">
                  <v-icon x-small>mdi-clock-outline</v-icon>
                  <span class="text-body-2">{{ tra.lastupdateTime }}</span>
                </span>
              </div>
            </div>

            <div class="audit-metrics">
              <article class="audit-metric">
                <span class="audit-detail__label text-caption">成交金额</span>
                <strong class="audit-metric__value text-subtitle-1 token-mono" data-ledger="amount">{{ tra.price }} 元</strong>
              </article>
              <article class="audit-metric">
                <span class="audit-detail__label text-caption">买方编号</span>
                <strong class="audit-metric__value text-subtitle-1 token-mono" data-identifier="trade-buyer">{{ tra.buyerId }}</strong>
              </article>
              <article class="audit-metric">
                <span class="audit-detail__label text-caption">卖方编号</span>
                <strong class="audit-metric__value text-subtitle-1 token-mono" data-identifier="trade-seller">{{ tra.salerId }}</strong>
              </article>
              <article class="audit-metric">
                <span class="audit-detail__label text-caption">监管备注</span>
                <strong class="audit-metric__value text-subtitle-1">{{ reviewHint(tra) }}</strong>
              </article>
            </div>
          </div>

          <v-expand-transition>
            <div v-show="tra.showDetails">
              <v-divider></v-divider>
              <div class="audit-detail-grid">
                <article class="audit-detail">
                  <span class="audit-detail__label text-caption">交易编号</span>
                  <strong class="audit-detail__value text-body-1 token-mono">{{ tra.id }}</strong>
                </article>
                <article class="audit-detail">
                  <span class="audit-detail__label text-caption">复核等级</span>
                  <strong class="audit-detail__value text-body-1">{{ reviewLabel(tra) }}</strong>
                </article>
                <article class="audit-detail">
                  <span class="audit-detail__label text-caption">交易时间</span>
                  <strong class="audit-detail__value text-body-1 token-mono">{{ tra.time }}</strong>
                </article>
                <article class="audit-detail">
                  <span class="audit-detail__label text-caption">链上时间戳</span>
                  <strong class="audit-detail__value text-body-1 token-mono">{{ tra.lastupdateTime }}</strong>
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
                  data-testid="trade-danger-action"
                  v-bind="attrs"
                  v-on="on"
                >
                  标记危险操作
                </v-btn>
              </template>

              <v-card class="audit-dialog">
                <v-card-title class="audit-dialog__title text-h6">确认执行交易处置</v-card-title>
                <v-card-text class="audit-dialog__copy text-body-2">
                  流水编号：{{ tra.id }}<br>
                  金额：{{ tra.price }} 元<br>
                  时间：{{ tra.time }}
                </v-card-text>
                <v-card-actions class="audit-dialog__actions">
                  <v-spacer></v-spacer>
                  <v-btn text class="audit-action" @click="dialog = false">保留记录</v-btn>
                  <v-btn text class="audit-action audit-action--danger" @click="UnvalidTrade(index)">继续提交</v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>

            <v-spacer></v-spacer>

            <v-btn text class="audit-action audit-card__toggle" @click="tra.showDetails = !tra.showDetails">
              {{ tra.showDetails ? '收起审计字段' : '展开审计字段' }}
              <v-icon right>{{ tra.showDetails ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
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
  name: "ShowTrade",
  computed: {
    flaggedCount() {
      return this.trades.filter((tra) => this.reviewLevel(tra) === "high").length;
    },
    latestUpdateLabel() {
      if (!this.trades.length) {
        return "等待链上回执";
      }
      const latestStamp = Math.max(...this.trades.map((tra) => tra.lastUpdateStamp || 0));
      return TimeService.timesampToTime(latestStamp);
    },
  },
  mounted() {
    this.getTradeList();
  },
  methods: {
    UnvalidTrade(index) {
      console.log(index);
      GlobalMessage.success("这功能还没做好，等下版本吧");
      this.dialog = false;
    },
    getTradeList() {
      UserService.getAllTradeInfo().then((resp) => {
        const traList = ResponseExtractor.getData(resp);
        this.trades = traList.map((item) => ({
          id: item.tradeId,
          time: TimeService.timesampToTime(item.tradeTime),
          price: item.price,
          buyerId: item.buyerId,
          salerId: item.salerId,
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
      return normalized || `trade-${index}`;
    },
    statusTone(state) {
      return state === "有效的" ? "success" : "warning";
    },
    reviewLevel(tra) {
      const price = Number(tra.price) || 0;
      if (price >= 1000) {
        return "high";
      }
      if (price >= 300) {
        return "medium";
      }
      return "low";
    },
    reviewTone(tra) {
      const toneMap = {
        high: "danger",
        medium: "warning",
        low: "success",
      };
      return toneMap[this.reviewLevel(tra)];
    },
    reviewLabel(tra) {
      const labelMap = {
        high: "高额复核",
        medium: "例行复核",
        low: "台账稳定",
      };
      return labelMap[this.reviewLevel(tra)];
    },
    reviewHint(tra) {
      return this.reviewLevel(tra) === "high" ? "关注高额成交与链上回写" : "按周期抽查";
    },
  },
  data() {
    return {
      dialog: false,
      trades: [],
      issuer: "",
    };
  },
};
</script>

<style scoped lang="scss">
@import "./superviser-audit.scss";
</style>
