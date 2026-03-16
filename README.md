# myTradingSystem

该项目是按你的要求，基于 `TradingSystem-Blockchain` 完整目录照搬到 `myTradingSystem` 后，再做运行环境适配的版本。

## 目录结构

```text
myTradingSystem
├─ backend/      # Java 后端
├─ frontend/     # Vue 前端
├─ chaincode/    # Fabric 链码
└─ doc/          # 设计与接口文档
```

## 运行环境

- Node.js 22
- JDK 17

## 已做的环境适配

- 后端 `sourceCompatibility` 调整为 Java 17。
- 后端默认使用 H2 内存库启动（避免本地强依赖 MySQL）。
- 增加 `trading.mock.enabled=true`，在无 Fabric 网络时可用 mock 方式跑通主要流程。
- 前端 CLI 升级到 Vue CLI 5，兼容更高版本 Node。

## 启动后端

```bash
cd backend/tradingSystem
gradlew.bat bootRun
```

- 后端地址：`http://127.0.0.1:16666`

## 启动前端

```bash
cd frontend/trading_system
npm install
npm run serve
```

- 前端地址：`http://localhost:8080`

## 说明

- 若你后续要接入真实 Fabric 与 MySQL，把 `backend/tradingSystem/src/main/resources/application.properties` 中 datasource 与 `trading.mock.enabled` 调整即可。
- 链码部署参考：`doc/开发文档/学习文档/如何部署链代码.md`。
