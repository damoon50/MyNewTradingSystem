const FIXED_TIMESTAMP = 1704067200000;

const roles = {
  guest: {
    account: "guest-account",
    role: null,
    user: null,
    navText: [],
    homePath: "/login",
  },
  business: {
    account: "13800138000",
    role: 2,
    user: {
      id: "13800138000",
      name: "Business Alice",
    },
    navText: ["主页", "待售商品", "上架商品", "已售商品"],
    homePath: "/BusHome",
  },
  customer: {
    account: "13900139000",
    role: 3,
    user: {
      id: "13900139000",
      name: "Customer Bob",
    },
    navText: ["主页", "购买商品", "已购买"],
    homePath: "/CusHome",
  },
  superviser: {
    account: "13700137000",
    role: 1,
    user: {
      id: "13700137000",
      name: "Superviser Carol",
    },
    navText: ["商家信息", "买家信息", "商品信息", "交易信息"],
    homePath: "/TradeInfo",
  },
};

const dataFixtures = {
  businessInfo: {
    name: "Business Alice",
    phone: "13800138000",
    commodityCount: 12,
    balance: 7800,
    lastUpdateTime: FIXED_TIMESTAMP,
  },
  customerInfo: {
    name: "Customer Bob",
    phone: "13900139000",
    commodityCount: 4,
    balance: 3200,
    lastUpdateTime: FIXED_TIMESTAMP,
  },
  onSaleGoods: [
    {
      id: 1001,
      name: "Cold Wallet",
      price: 499,
      issuerId: "13800138000",
      issuerName: "Business Alice",
      ownerName: "",
      lastUpdate: FIXED_TIMESTAMP,
      lastUpdateTime: FIXED_TIMESTAMP,
    },
    {
      id: 1002,
      name: "Ledger Backup",
      price: 199,
      issuerId: "13800138000",
      issuerName: "Business Alice",
      ownerName: "",
      lastUpdate: FIXED_TIMESTAMP,
      lastUpdateTime: FIXED_TIMESTAMP,
    },
  ],
  purchasedGoods: [
    {
      id: 2001,
      name: "Smart Token",
      price: 89,
      issuerId: "13800138000",
      issuerName: "Business Alice",
      ownerName: "Customer Bob",
      lastUpdate: FIXED_TIMESTAMP,
      lastUpdateTime: FIXED_TIMESTAMP,
    },
  ],
  soldGoods: [
    {
      id: 3001,
      name: "Audit Badge",
      price: 129,
      issuerId: "13800138000",
      issuerName: "Business Alice",
      ownerName: "Customer Bob",
      lastUpdate: FIXED_TIMESTAMP,
      lastUpdateTime: FIXED_TIMESTAMP,
    },
  ],
  allBusiness: [
    {
      name: "Business Alice",
      phone: "13800138000",
      commodityCount: 12,
      balance: 7800,
      lastUpdateTime: FIXED_TIMESTAMP,
    },
  ],
  allCustomers: [
    {
      name: "Customer Bob",
      phone: "13900139000",
      commodityCount: 4,
      balance: 3200,
      lastUpdateTime: FIXED_TIMESTAMP,
    },
  ],
  allCommodity: [
    {
      id: 4001,
      name: "Settlement Key",
      price: 1000,
      issuerId: "13800138000",
      issuerName: "Business Alice",
      ownerName: "Customer Bob",
      lastUpdate: FIXED_TIMESTAMP,
      lastUpdateTime: FIXED_TIMESTAMP,
    },
  ],
  allTrades: [
    {
      tradeId: 5001,
      tradeTime: FIXED_TIMESTAMP,
      price: 1000,
      buyerId: "13900139000",
      salerId: "13800138000",
      lastUpdateTime: FIXED_TIMESTAMP,
    },
  ],
};

module.exports = {
  FIXED_TIMESTAMP,
  roles,
  dataFixtures,
};
