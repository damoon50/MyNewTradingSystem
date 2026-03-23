<template>
  <v-container class="customer-ledger-page main-wrapper" data-testid="customer-home-page">
    <section class="customer-ledger-page__hero" data-testid="customer-home-hero">
      <div class="customer-ledger-page__hero-copy">
        <p class="customer-ledger-page__eyebrow">Customer ledger</p>
        <h1 class="customer-ledger-page__title">消费者账本总览</h1>
        <p class="customer-ledger-page__intro">
          将余额、已购数量和当月支出集中成一张紧凑总表，方便在进入购买页前先确认账户状态。
        </p>
      </div>
      <div class="customer-ledger-page__hero-side">
        <div
          class="customer-ledger-status-chip customer-ledger-status-chip--primary"
          data-testid="customer-home-status-chip"
        >
          Live ledger
        </div>
        <div class="customer-ledger-page__hero-note">
          <span class="customer-ledger-page__hero-label">Account line</span>
          <span class="customer-ledger-page__hero-value token-mono" data-identifier>{{ phone }}</span>
        </div>
      </div>
    </section>

    <section class="customer-ledger-page__grid">
      <v-card class="customer-ledger-panel" elevation="1">
        <div class="customer-ledger-panel__section customer-ledger-profile">
          <div class="customer-ledger-profile__identity">
            <v-avatar size="96">
              <img src="../../assets/avatar.jpg" alt="Customer avatar">
            </v-avatar>
            <div>
              <h2 class="customer-ledger-profile__name">{{ username }}</h2>
              <div class="text--secondary">消费者账户</div>
            </div>
          </div>

          <div class="customer-ledger-detail-list">
            <div class="customer-ledger-detail-list__item">
              <span class="customer-ledger-detail-list__label">Phone</span>
              <span class="customer-ledger-detail-list__value token-mono" data-identifier>{{ phone }}</span>
            </div>
            <div class="customer-ledger-detail-list__item">
              <span class="customer-ledger-detail-list__label">Balance line</span>
              <span class="customer-ledger-detail-list__value">
                RMB <span class="token-mono" data-ledger="amount">{{ formatNumber(pricesum) }}</span>
              </span>
            </div>
          </div>
        </div>

        <div class="customer-ledger-panel__section">
          <blockquote class="customer-ledger-quote">
            人生在世，谁能比得上商人那样逍遥富乐呢？
          </blockquote>
        </div>
      </v-card>

      <div class="customer-ledger-page__stack">
        <v-card class="customer-ledger-panel" elevation="1">
          <div class="customer-ledger-panel__section">
            <div class="customer-ledger-panel__heading">
              <div>
                <p class="customer-ledger-panel__eyebrow">Snapshot</p>
                <h2 class="customer-ledger-panel__title">账户摘要</h2>
                <p class="customer-ledger-panel__subtitle">每个关键数字都保留清晰的账本层级，便于快速核对。</p>
              </div>
            </div>

            <div class="customer-ledger-summary" data-testid="customer-home-summary">
              <article class="customer-ledger-summary__item" data-testid="customer-home-summary-card">
                <span class="customer-ledger-summary__label">Purchased items</span>
                <span
                  class="customer-ledger-summary__value token-mono"
                  data-ledger="count"
                  data-testid="customer-home-summary-purchases"
                >
                  {{ formatNumber(salesnum) }}
                </span>
                <span class="customer-ledger-summary__helper">累计购入商品数量</span>
              </article>

              <article class="customer-ledger-summary__item" data-testid="customer-home-summary-card">
                <span class="customer-ledger-summary__label">Available balance</span>
                <span
                  class="customer-ledger-summary__value token-mono"
                  data-ledger="amount"
                  data-testid="customer-home-summary-balance"
                >
                  {{ formatNumber(pricesum) }}
                </span>
                <span class="customer-ledger-summary__helper">可继续用于购买的余额</span>
              </article>

              <article class="customer-ledger-summary__item" data-testid="customer-home-summary-card">
                <span class="customer-ledger-summary__label">Month-to-date spent</span>
                <span
                  class="customer-ledger-summary__value token-mono"
                  data-ledger="amount"
                  data-testid="customer-home-summary-month-spent"
                >
                  {{ formatNumber(pricemonth) }}
                </span>
                <span class="customer-ledger-summary__helper">本月累计支出</span>
              </article>
            </div>
          </div>
        </v-card>

        <v-card class="customer-ledger-panel" elevation="1">
          <div class="customer-ledger-panel__section">
            <div class="customer-ledger-panel__heading">
              <div>
                <p class="customer-ledger-panel__eyebrow">Timeline</p>
                <h2 class="customer-ledger-panel__title">支出台账</h2>
                <p class="customer-ledger-panel__subtitle">按账期查看本月支出和当前结余，保留清晰的流水式阅读顺序。</p>
              </div>
              <div class="customer-ledger-status-chip" data-testid="customer-home-history-chip">
                {{ ledgerEntries.length }} entries
              </div>
            </div>

            <div
              v-if="ledgerEntries.length"
              class="customer-ledger-record-list"
              data-testid="customer-home-record-list"
            >
              <article
                v-for="(outcome, index) in ledgerEntries"
                :key="recordKey(outcome, index)"
                class="customer-ledger-record"
                data-testid="customer-home-record-card"
              >
                <div class="customer-ledger-record__header">
                  <div>
                    <p class="customer-ledger-panel__eyebrow">Ledger month</p>
                    <h3 class="customer-ledger-record__title">
                      <span class="token-mono" data-ledger="month">{{ outcome.month }}</span>
                      月结算
                    </h3>
                    <p class="customer-ledger-record__meta">支出金额与结余共同记录在同一张账卡里。</p>
                  </div>
                  <div
                    class="customer-ledger-status-chip"
                    :class="index === 0 ? 'customer-ledger-status-chip--primary' : ''"
                    data-testid="customer-home-record-status-chip"
                  >
                    {{ index === 0 ? 'Current' : 'Archive' }}
                  </div>
                </div>

                <div class="customer-ledger-record__grid">
                  <div class="customer-ledger-record__metric">
                    <span class="customer-ledger-record__label">Spent</span>
                    <span class="customer-ledger-record__value">
                      RMB <span class="token-mono" data-ledger="amount">{{ formatNumber(outcome.outcome) }}</span>
                    </span>
                  </div>
                  <div class="customer-ledger-record__metric">
                    <span class="customer-ledger-record__label">Balance after entry</span>
                    <span class="customer-ledger-record__value">
                      RMB <span class="token-mono" data-ledger="amount">{{ formatNumber(outcome.total) }}</span>
                    </span>
                  </div>
                </div>
              </article>
            </div>

            <div v-else class="customer-ledger-empty" data-testid="customer-home-empty-state">
              <p class="customer-ledger-empty__title">暂时没有支出流水</p>
              <p class="customer-ledger-empty__copy">完成首笔购买后，这里会按账期汇总你的支出记录。</p>
            </div>
          </div>
        </v-card>
      </div>
    </section>
  </v-container>
</template>

<script>
import UserService from '../../api/auth/user'
import ResponseExtractor from '../../utils/response-extractor'
import TimeService from '../../api/time/time'

export default {
  name: 'CusHome',
  mounted() {
    this.getCusInfo()
  },
  data() {
    return {
      username: 'Susan',
      phone: '1821234567',
      salesnum: 0,
      pricesum: 0,
      pricemonth: 0,
      OutComeDetails: [],
    }
  },
  computed: {
    ledgerEntries() {
      return this.OutComeDetails.filter((entry) => entry && entry.month !== undefined)
    },
  },
  methods: {
    async getCusInfo() {
      const customerResp = await UserService.getCusInfo()
      const customer = ResponseExtractor.getData(customerResp)

      this.username = customer.name
      this.phone = customer.phone
      this.salesnum = customer.commodityCount
      this.pricesum = customer.balance

      const monthSpentResp = await UserService.getCusMonthSpent()
      this.pricemonth = ResponseExtractor.getData(monthSpentResp)

      const accountListResp = await UserService.getCusAccountList()
      const accountList = ResponseExtractor.getData(accountListResp) || []

      this.OutComeDetails = [
        {
          month: TimeService.nowTime().month,
          outcome: this.pricemonth,
          total: this.pricesum,
        },
        ...accountList,
      ]
    },
    formatNumber(value) {
      const numericValue = Number(value)
      if (Number.isNaN(numericValue)) {
        return value
      }
      return new Intl.NumberFormat('zh-CN').format(numericValue)
    },
    recordKey(entry, index) {
      return `${entry.month || 'entry'}-${index}`
    },
  },
}
</script>

<style scoped lang="scss">
@import '../../styles/customer-ledger';

.main-wrapper {
  max-width: var(--ts-page-max-width);
}
</style>
