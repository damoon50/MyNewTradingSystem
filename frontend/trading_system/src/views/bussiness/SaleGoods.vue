<template>
  <v-container class="sale-goods-page main-cols-wrapper" data-testid="sale-goods-page">
    <section class="sale-goods-hero">
      <div class="sale-goods-hero__copy">
        <p class="sale-goods-hero__eyebrow">Listing desk</p>
        <h1 class="sale-goods-hero__title">上架商品</h1>
        <p class="sale-goods-hero__description">
          录入名称和价格后即可发起上架。保持字段准确，库存看板会同步展示这条记录。
        </p>
      </div>
      <router-link
        to="/goodsOnSale"
        class="sale-goods-hero__link"
        data-testid="sale-goods-secondary-action"
      >
        返回待售商品
        <v-icon small>mdi-arrow-right</v-icon>
      </router-link>
    </section>

    <div class="sale-goods-layout">
      <v-card class="sale-goods-card" elevation="2">
        <v-form
          v-model="valid"
          ref="goodsFrom"
          lazy-validation
          class="sale-goods-form"
        >
          <div class="sale-goods-form__header">
            <div>
              <p class="sale-goods-form__eyebrow">Create listing</p>
              <h2 class="sale-goods-form__title">商品基础信息</h2>
            </div>
            <span class="sale-goods-form__badge">即时上架</span>
          </div>

          <v-text-field
            v-model="goodRegister.name"
            :rules="rules.basicRules"
            label="请输入商品名称"
            class="sale-goods-form__field"
            data-testid="sale-goods-name-input"
            hide-details
            rounded
            filled
            single-line
          ></v-text-field>

          <v-text-field
            v-model="goodRegister.price"
            :rules="rules.basicRules"
            label="请输入商品价格"
            class="sale-goods-form__field"
            data-testid="sale-goods-price-input"
            hide-details
            rounded
            filled
            single-line
          ></v-text-field>

          <div class="sale-goods-form__actions">
            <v-btn
              block
              depressed
              color="primary"
              class="sale-goods-form__submit"
              height="50px"
              data-testid="sale-goods-primary-action"
              @click="salegood"
            >
              <v-icon left>mdi-package-variant-plus</v-icon>
              上架商品
            </v-btn>
          </div>
        </v-form>
      </v-card>

      <aside class="sale-goods-side-panel">
        <section class="sale-goods-side-panel__card" data-testid="sale-goods-preview-card">
          <p class="sale-goods-side-panel__eyebrow">Listing preview</p>
          <div class="sale-goods-side-panel__preview-name">
            {{ goodRegister.name || "等待输入商品名称" }}
          </div>
          <div class="sale-goods-side-panel__preview-price token-mono" data-ledger="amount">
            {{ previewPrice }} 元
          </div>
          <p class="sale-goods-side-panel__copy">提交后会沿用当前商家身份和原有接口 payload。</p>
        </section>

        <section class="sale-goods-side-panel__card" data-testid="sale-goods-guidance-card">
          <p class="sale-goods-side-panel__eyebrow">Publish checklist</p>
          <ul class="sale-goods-side-panel__list">
            <li>名称尽量简洁，方便在库存卡片里快速识别。</li>
            <li>价格需要是数字，沿用当前的上架校验逻辑。</li>
            <li>发布成功后会跳转回待售商品列表。</li>
          </ul>
        </section>
      </aside>
    </div>
  </v-container>
</template>

<script>
import GoodService from "../../api/goods/goods";
import GlobalMessage from "../../components/GlobalMsgbar/api";
import ResponseExtractor from "../../utils/response-extractor";

export default {
  name: "SalesGood",
  components: {},
  data: () => ({
    valid: false,
    goodRegister: {
      name: "",
      price :"",
    },
    rules: {
      basicRules: [(v) => !!v || "Req uired"],
    },
  }),
  computed: {
    previewPrice() {
      const numericValue = Number(this.goodRegister.price);
      if (Number.isFinite(numericValue) && this.goodRegister.price !== "") {
        return numericValue.toLocaleString("zh-CN");
      }
      return "0";
    },
  },
  methods: {
    async salegood(){
      if (this.$refs.goodsFrom.validate()){

        var price = this.goodRegister.price
        console.log(price)
        if (Number(price)){
          console.log("is price")
            GoodService.saleGood(this.goodRegister).then((resp) => {
            const data = ResponseExtractor.getData(resp);
            GlobalMessage.success("商品上架成功");
            console.log("salegood response result", data);
            this.$router.push({ path :"/goodsOnSale"}).catch(err => console.log(err));
          }).catch((error) => {
            console.log("register failed", error);
          })
        }else{
            GlobalMessage.error("请输入正确价格:(");


        }



      }
    }

  },
};
</script>

<style scoped>
.sale-goods-page {
  max-width: var(--ts-page-max-width);
  padding-top: var(--ts-space-4);
  padding-bottom: var(--ts-space-8);
}

.sale-goods-hero {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--ts-space-4);
  margin-bottom: var(--ts-space-4);
  padding: var(--ts-space-5);
  border: 1px solid var(--ts-color-border);
  border-radius: var(--ts-radius-lg);
  background:
    linear-gradient(135deg, var(--ts-color-primary-soft), var(--ts-color-info-soft)),
    var(--ts-color-surface-glass);
  box-shadow: var(--ts-shadow-md);
}

.sale-goods-hero__copy {
  display: grid;
  gap: var(--ts-space-2);
  max-width: 680px;
}

.sale-goods-hero__eyebrow,
.sale-goods-form__eyebrow,
.sale-goods-side-panel__eyebrow {
  margin: 0;
  color: var(--ts-color-muted-text);
  font-family: var(--ts-font-mono);
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.sale-goods-hero__title,
.sale-goods-form__title {
  margin: 0;
  color: var(--ts-color-text);
  font-size: clamp(1.5rem, 2vw, 2.1rem);
  font-weight: 700;
  letter-spacing: -0.03em;
}

.sale-goods-hero__description {
  margin: 0;
  color: var(--ts-color-muted-text);
  line-height: 1.7;
}

.sale-goods-hero__link {
  display: inline-flex;
  align-items: center;
  gap: var(--ts-space-2);
  color: var(--ts-color-primary);
  font-weight: 600;
  text-decoration: none;
}

.sale-goods-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(300px, 0.8fr);
  gap: var(--ts-space-4);
}

.sale-goods-card,
.sale-goods-side-panel__card {
  border: 1px solid var(--ts-color-border);
  border-radius: var(--ts-radius-lg) !important;
  background: var(--ts-color-surface) !important;
}

.sale-goods-card {
  padding: var(--ts-space-5);
  box-shadow: var(--ts-shadow-md);
}

.sale-goods-form {
  display: grid;
  gap: var(--ts-space-4);
}

.sale-goods-form__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--ts-space-3);
}

.sale-goods-form__badge {
  display: inline-flex;
  align-items: center;
  min-height: 34px;
  padding: 0 var(--ts-space-3);
  border-radius: var(--ts-radius-pill);
  background: var(--ts-color-success-soft);
  color: var(--ts-color-success);
  font-size: 0.78rem;
  font-weight: 700;
}

.sale-goods-form__submit {
  width: 100%;
}

.sale-goods-side-panel {
  display: grid;
  gap: var(--ts-space-4);
}

.sale-goods-side-panel__card {
  display: grid;
  gap: var(--ts-space-3);
  padding: var(--ts-space-4);
  box-shadow: var(--ts-shadow-sm);
}

.sale-goods-side-panel__preview-name,
.sale-goods-side-panel__preview-price {
  color: var(--ts-color-text);
  font-weight: 700;
}

.sale-goods-side-panel__preview-name {
  font-size: 1.05rem;
}

.sale-goods-side-panel__preview-price {
  color: var(--ts-color-primary);
  font-size: 1.7rem;
  letter-spacing: -0.04em;
}

.sale-goods-side-panel__copy {
  margin: 0;
  color: var(--ts-color-muted-text);
  line-height: 1.7;
}

.sale-goods-side-panel__list {
  margin: 0;
  padding-left: var(--ts-space-4);
  color: var(--ts-color-text);
  line-height: 1.8;
}

@media (max-width: 960px) {
  .sale-goods-page {
    padding-top: 0;
  }

  .sale-goods-hero,
  .sale-goods-form__header {
    flex-direction: column;
    align-items: flex-start;
  }

  .sale-goods-layout {
    grid-template-columns: 1fr;
  }

  .sale-goods-card {
    padding: var(--ts-space-4);
  }
}
</style>



