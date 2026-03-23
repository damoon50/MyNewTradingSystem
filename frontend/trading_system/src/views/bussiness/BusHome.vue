<template>
  <div class="business-home" data-testid="business-home-page">
    <v-container class="business-home__container main-wrapper">
      <section class="business-hero" data-testid="business-home-hero">
        <div class="business-hero__copy">
          <p class="business-hero__eyebrow">Business cockpit</p>
          <h1 class="business-hero__title">经营总览</h1>
          <p class="business-hero__description">
            把利润、库存和入账节奏放在一屏里，方便你快速判断今天该补货、上新还是盘点。
          </p>
        </div>
        <div class="business-hero__actions">
          <v-btn
            depressed
            color="primary"
            class="business-hero__action business-hero__action--primary"
            to="/SaleGoods"
            data-testid="business-home-primary-action"
          >
            立即上架
          </v-btn>
          <v-btn
            outlined
            class="business-hero__action"
            to="/goodsOnSale"
            data-testid="business-home-secondary-action"
          >
            查看库存
          </v-btn>
        </div>
      </section>

      <v-row class="business-home__grid" dense>
        <v-col cols="12" lg="4">
          <v-card class="business-panel business-panel--profile" elevation="1">
            <section class="business-profile">
              <v-avatar size="96" class="business-profile__avatar">
                <img src="../../assets/avatar.jpg" alt="Business avatar">
              </v-avatar>
              <div class="business-profile__identity">
                <p class="business-profile__eyebrow">Operator profile</p>
                <h2 class="business-profile__name">{{ username }}</h2>
                <p class="business-profile__phone token-mono" data-identifier="business-phone">
                  {{ phone }}
                </p>
              </div>
            </section>

            <div class="business-profile__meta">
              <div class="business-profile__meta-item">
                <span class="business-profile__meta-label">本月周期</span>
                <strong class="business-profile__meta-value token-mono" data-ledger="month">
                  {{ currentMonthLabel }} 月
                </strong>
              </div>
              <div class="business-profile__meta-item">
                <span class="business-profile__meta-label">最近入账</span>
                <strong class="business-profile__meta-value">
                  {{ latestIncomeLabel }}
                </strong>
              </div>
            </div>

            <div class="business-profile__quote" data-testid="business-home-quote">
              <p class="business-profile__quote-label">经营提示</p>
              <p class="business-profile__quote-copy">
                人生在世，谁能比得上商人那样逍遥富乐呢？
              </p>
            </div>

            <div class="business-profile__links">
              <router-link
                v-for="link in quickLinks"
                :key="link.to"
                :to="link.to"
                class="business-profile__link"
                :data-testid="link.testId"
              >
                <span class="business-profile__link-copy">
                  <strong>{{ link.label }}</strong>
                  <small>{{ link.caption }}</small>
                </span>
                <v-icon small>mdi-arrow-top-right</v-icon>
              </router-link>
            </div>
          </v-card>
        </v-col>

        <v-col cols="12" lg="8">
          <div class="business-summary-grid">
            <article
              v-for="metric in summaryMetrics"
              :key="metric.key"
              class="business-summary-card"
              :style="metric.style"
              :data-testid="metric.testId"
            >
              <p class="business-summary-card__label">{{ metric.label }}</p>
              <p class="business-summary-card__value">
                <span class="token-mono" :data-ledger="metric.dataLedger">{{ metric.value }}</span>
                <small>{{ metric.unit }}</small>
              </p>
              <p class="business-summary-card__hint">{{ metric.hint }}</p>
            </article>
          </div>

          <v-card class="business-panel business-panel--ledger" elevation="1">
            <div class="business-panel__header">
              <div>
                <p class="business-panel__eyebrow">Profit ledger</p>
                <h2 class="business-panel__title">收入明细</h2>
              </div>
              <div class="business-panel__header-meta">
                <span class="business-chip">{{ incomeDetails.length }} 条记录</span>
                <span class="business-chip business-chip--accent">利润节奏</span>
              </div>
            </div>

            <div
              v-if="incomeDetails.length"
              class="business-ledger"
              data-testid="business-home-income-list"
            >
              <article
                v-for="(income, index) in incomeDetails"
                :key="`${income.month}-${index}`"
                class="business-ledger__row"
                :data-testid="`business-home-income-entry-${index}`"
              >
                <div class="business-ledger__month">
                  <span class="business-ledger__month-number token-mono" data-ledger="month">
                    {{ income.month }}
                  </span>
                  <span class="business-ledger__month-label">月</span>
                </div>
                <div class="business-ledger__metric">
                  <span class="business-ledger__metric-label">当月收入</span>
                  <strong class="business-ledger__metric-value token-mono" data-ledger="amount">
                    {{ income.income }}
                  </strong>
                </div>
                <div class="business-ledger__metric">
                  <span class="business-ledger__metric-label">累计利润</span>
                  <strong class="business-ledger__metric-value token-mono" data-ledger="amount">
                    {{ income.total }}
                  </strong>
                </div>
              </article>
            </div>

            <div
              v-else
              class="business-empty-state"
              data-testid="business-home-income-empty-state"
            >
              <v-icon color="primary">mdi-chart-timeline-variant</v-icon>
              <strong>暂无收入明细</strong>
              <p>新的成交入账后，这里会自动出现最近的利润轨迹。</p>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import UserService from '../../api/auth/user'
import TimeService from '../../api/time/time'
import ResponseExtractor from '../../utils/response-extractor'


export default {

  name: "BusHome",
  mounted(){
    this.loadDashboard()
  },
  data() {
    return {
      username: "Susan",
      phone: "1821234567",
      salesnum: "60",
      pricesum: "100",
      pricemonth: "60",
      IncomeDetails: [],

    }
  },
  computed: {
    currentMonthLabel() {
      return TimeService.nowTime().month;
    },
    incomeDetails() {
      return this.IncomeDetails;
    },
    latestIncomeLabel() {
      if (!this.incomeDetails.length) {
        return "等待入账";
      }
      return `${this.formatAmount(this.incomeDetails[0].income)} 元`;
    },
    quickLinks() {
      return [
        {
          to: "/goodsOnSale",
          label: "库存看板",
          caption: "追踪当前在售商品",
          testId: "business-home-link-inventory",
        },
        {
          to: "/GoodsSaled",
          label: "成交复盘",
          caption: "查看已售买家与成交额",
          testId: "business-home-link-sold",
        },
      ];
    },
    summaryMetrics() {
      return [
        {
          key: "sales-count",
          label: "已售件数",
          value: this.formatAmount(this.salesnum),
          unit: "件",
          hint: "累计成交的商品数量",
          dataLedger: "count",
          testId: "business-home-summary-sales-count",
          style: {
            "--business-summary-accent": "var(--ts-color-primary)",
            "--business-summary-surface": "var(--ts-color-primary-soft)",
          },
        },
        {
          key: "profit-total",
          label: "累计利润",
          value: this.formatAmount(this.pricesum),
          unit: "元",
          hint: "所有成交汇总后的收益",
          dataLedger: "amount",
          testId: "business-home-summary-profit-total",
          style: {
            "--business-summary-accent": "var(--ts-color-success)",
            "--business-summary-surface": "var(--ts-color-success-soft)",
          },
        },
        {
          key: "profit-month",
          label: "本月利润",
          value: this.formatAmount(this.pricemonth),
          unit: "元",
          hint: "当前月份的最新利润快照",
          dataLedger: "amount",
          testId: "business-home-summary-profit-month",
          style: {
            "--business-summary-accent": "var(--ts-color-info)",
            "--business-summary-surface": "var(--ts-color-info-soft)",
          },
        },
      ];
    },
  },
  methods: {
    formatAmount(value) {
      const numericValue = Number(value);
      if (Number.isFinite(numericValue)) {
        return numericValue.toLocaleString("zh-CN");
      }
      return value || "0";
    },
    normalizeIncomeDetail(detail) {
      return {
        month: detail.month || TimeService.nowTime().month,
        income: this.formatAmount(detail.income != null ? detail.income : detail.outcome),
        total: this.formatAmount(detail.total),
      };
    },
    createCurrentMonthSnapshot() {
      return {
        month: TimeService.nowTime().month,
        income: this.formatAmount(this.pricemonth),
        total: this.formatAmount(this.pricesum),
      };
    },
    assignFallbackData() {
      this.pricemonth = "10";
      this.username = "busnissman";
      this.phone = "12345678910";
      this.salesnum = "3";
      this.pricesum = "100";
      this.IncomeDetails = [
        {
          month: "5",
          income: this.formatAmount(10),
          total: this.formatAmount(100),
        },
        {
          month: "4",
          income: this.formatAmount(20),
          total: this.formatAmount(90),
        },
        {
          month: "3",
          income: this.formatAmount(70),
          total: this.formatAmount(70),
        },
      ];
    },
    async loadDashboard() {
      try {
        const [busResp, profitResp, accountResp] = await Promise.all([
          UserService.getBusInfo(),
          UserService.getBusMonthProfit(),
          UserService.getBusAccountList(),
        ]);
        const bus = ResponseExtractor.getData(busResp);
        const profit = ResponseExtractor.getData(profitResp);
        const accountList = ResponseExtractor.getData(accountResp) || [];

        this.username = bus.name;
        this.phone = bus.phone;
        this.salesnum = bus.commodityCount;
        this.pricesum = bus.balance;
        this.pricemonth = profit;

        this.IncomeDetails = [
          this.createCurrentMonthSnapshot(),
          ...accountList.map((detail) => this.normalizeIncomeDetail(detail)),
        ];
      } catch (error) {
        this.assignFallbackData();
      }
    },
  }
}
</script>

<style scoped>
.main-wrapper {
  max-width: var(--ts-page-max-width);
}

.business-home {
  width: 100%;
}

.business-home__container {
  padding-top: var(--ts-space-4);
  padding-bottom: var(--ts-space-8);
}

.business-home__grid {
  margin-top: 0;
}

.business-hero {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--ts-space-4);
  margin-bottom: var(--ts-space-5);
  padding: var(--ts-space-5);
  border: 1px solid var(--ts-color-border);
  border-radius: var(--ts-radius-lg);
  background:
    linear-gradient(135deg, var(--ts-color-primary-soft), var(--ts-color-info-soft)),
    var(--ts-color-surface-glass);
  box-shadow: var(--ts-shadow-md);
}

.business-hero__copy {
  display: grid;
  gap: var(--ts-space-2);
  max-width: 680px;
}

.business-hero__eyebrow,
.business-panel__eyebrow,
.business-profile__eyebrow {
  margin: 0;
  color: var(--ts-color-muted-text);
  font-family: var(--ts-font-mono);
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.business-hero__title,
.business-panel__title,
.business-profile__name {
  margin: 0;
  color: var(--ts-color-text);
  font-size: clamp(1.6rem, 2vw, 2.2rem);
  font-weight: 700;
  letter-spacing: -0.03em;
}

.business-hero__description {
  margin: 0;
  color: var(--ts-color-muted-text);
  font-size: 0.96rem;
  line-height: 1.7;
}

.business-hero__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: var(--ts-space-3);
}

.business-hero__action {
  min-width: 132px;
}

.business-panel {
  border: 1px solid var(--ts-color-border);
  border-radius: var(--ts-radius-lg) !important;
  background: var(--ts-color-surface) !important;
}

.business-panel--profile {
  height: 100%;
  padding: var(--ts-space-5);
}

.business-profile {
  display: flex;
  align-items: center;
  gap: var(--ts-space-4);
}

.business-profile__avatar {
  border: 4px solid var(--ts-color-primary-soft);
}

.business-profile__identity {
  display: grid;
  gap: var(--ts-space-1);
  min-width: 0;
}

.business-profile__phone {
  margin: 0;
  color: var(--ts-color-muted-text);
  font-size: 0.86rem;
}

.business-profile__meta {
  display: grid;
  gap: var(--ts-space-3);
  margin-top: var(--ts-space-5);
}

.business-profile__meta-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--ts-space-3);
  padding: var(--ts-space-3) var(--ts-space-4);
  border: 1px solid var(--ts-color-border);
  border-radius: var(--ts-radius-md);
  background: var(--ts-color-elevated-surface);
}

.business-profile__meta-label {
  color: var(--ts-color-muted-text);
  font-size: 0.84rem;
}

.business-profile__meta-value {
  color: var(--ts-color-text);
  font-size: 0.92rem;
}

.business-profile__quote {
  margin-top: var(--ts-space-5);
  padding: var(--ts-space-4);
  border-radius: var(--ts-radius-md);
  background: var(--ts-color-primary-soft);
}

.business-profile__quote-label {
  margin: 0 0 var(--ts-space-2);
  color: var(--ts-color-primary);
  font-family: var(--ts-font-mono);
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.business-profile__quote-copy {
  margin: 0;
  color: var(--ts-color-text);
  line-height: 1.7;
}

.business-profile__links {
  display: grid;
  gap: var(--ts-space-3);
  margin-top: var(--ts-space-5);
}

.business-profile__link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--ts-space-3);
  padding: var(--ts-space-4);
  border: 1px solid var(--ts-color-border);
  border-radius: var(--ts-radius-md);
  color: inherit;
  text-decoration: none;
  transition:
    transform var(--ts-transition-base),
    border-color var(--ts-transition-base),
    box-shadow var(--ts-transition-base);
}

.business-profile__link:hover {
  transform: translateY(-1px);
  border-color: var(--ts-color-primary);
  box-shadow: var(--ts-shadow-sm);
}

.business-profile__link-copy {
  display: grid;
  gap: var(--ts-space-1);
}

.business-profile__link-copy strong {
  color: var(--ts-color-text);
  font-size: 0.95rem;
}

.business-profile__link-copy small {
  color: var(--ts-color-muted-text);
  font-size: 0.8rem;
}

.business-summary-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--ts-space-3);
  margin-bottom: var(--ts-space-4);
}

.business-summary-card {
  display: grid;
  gap: var(--ts-space-2);
  padding: var(--ts-space-4);
  border: 1px solid var(--ts-color-border);
  border-radius: var(--ts-radius-md);
  background: linear-gradient(180deg, var(--business-summary-surface), var(--ts-color-surface));
  box-shadow: var(--ts-shadow-sm);
}

.business-summary-card__label,
.business-summary-card__hint {
  margin: 0;
}

.business-summary-card__label {
  color: var(--ts-color-muted-text);
  font-size: 0.8rem;
}

.business-summary-card__value {
  display: flex;
  align-items: baseline;
  gap: var(--ts-space-2);
  margin: 0;
  color: var(--business-summary-accent);
  font-size: 1.55rem;
  font-weight: 700;
  letter-spacing: -0.04em;
}

.business-summary-card__value small {
  font-size: 0.82rem;
  font-weight: 600;
}

.business-summary-card__hint {
  color: var(--ts-color-text);
  font-size: 0.84rem;
  line-height: 1.6;
}

.business-panel--ledger {
  padding: var(--ts-space-5);
}

.business-panel__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--ts-space-4);
  margin-bottom: var(--ts-space-4);
}

.business-panel__header-meta {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: var(--ts-space-2);
}

.business-chip {
  display: inline-flex;
  align-items: center;
  min-height: 34px;
  padding: 0 var(--ts-space-3);
  border: 1px solid var(--ts-color-border);
  border-radius: var(--ts-radius-pill);
  background: var(--ts-color-elevated-surface);
  color: var(--ts-color-muted-text);
  font-size: 0.78rem;
  font-weight: 600;
}

.business-chip--accent {
  border-color: var(--ts-color-primary-tint);
  background: var(--ts-color-primary-soft);
  color: var(--ts-color-primary);
}

.business-ledger {
  display: grid;
  gap: var(--ts-space-3);
}

.business-ledger__row {
  display: grid;
  grid-template-columns: 88px repeat(2, minmax(0, 1fr));
  gap: var(--ts-space-3);
  align-items: center;
  padding: var(--ts-space-4);
  border: 1px solid var(--ts-color-border);
  border-radius: var(--ts-radius-md);
  background: var(--ts-color-elevated-surface);
}

.business-ledger__month {
  display: grid;
  gap: 2px;
}

.business-ledger__month-number {
  color: var(--ts-color-primary);
  font-size: 1.35rem;
  font-weight: 700;
}

.business-ledger__month-label,
.business-ledger__metric-label {
  color: var(--ts-color-muted-text);
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.business-ledger__metric {
  display: grid;
  gap: var(--ts-space-1);
}

.business-ledger__metric-value {
  color: var(--ts-color-text);
  font-size: 1.05rem;
}

.business-empty-state {
  display: grid;
  justify-items: start;
  gap: var(--ts-space-2);
  padding: var(--ts-space-5);
  border: 1px dashed var(--ts-color-border);
  border-radius: var(--ts-radius-md);
  background: var(--ts-color-elevated-surface);
}

.business-empty-state strong,
.business-empty-state p {
  margin: 0;
}

.business-empty-state p {
  color: var(--ts-color-muted-text);
  line-height: 1.6;
}

@media (max-width: 1264px) {
  .business-summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 960px) {
  .business-home__container {
    padding-top: 0;
  }

  .business-hero,
  .business-panel--ledger,
  .business-panel--profile {
    padding: var(--ts-space-4);
  }

  .business-hero,
  .business-panel__header,
  .business-profile {
    flex-direction: column;
    align-items: flex-start;
  }

  .business-hero__actions,
  .business-panel__header-meta {
    justify-content: flex-start;
  }

  .business-summary-grid,
  .business-ledger__row {
    grid-template-columns: 1fr;
  }

  .business-ledger__month {
    display: flex;
    align-items: baseline;
    gap: var(--ts-space-2);
  }
}

@media (max-width: 600px) {
  .business-summary-grid {
    grid-template-columns: 1fr;
  }
}
</style>
