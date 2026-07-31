# Options Scanner — 美股期权标的筛选与策略推荐

扫描高流动性美股/ETF，根据价格、成交量、期权活跃度与短期走势，给出适合做期权的标的评分，并推荐对应策略（Cash-Secured Put、Iron Condor、Bull/Bear Spreads 等）。

## 功能

- 精选高期权成交量/持仓量标的宇宙（约 80+ 只，覆盖主流科技、金融、能源、ETF 等）
- 实时报价（Yahoo Finance）
- 可调节筛选：价格区间、适合度分数、行业、策略偏向（看涨/看跌/中性）
- 每只股票展开后显示推荐策略说明与适用场景
- 深色现代 UI，支持移动端

## 技术栈

- Next.js 14 (App Router)
- TypeScript + Tailwind CSS
- 部署目标：Vercel

## 本地运行

```bash
npm install
npm run dev
```

打开 http://localhost:3000

## 说明与局限

- 「IV Rank」为基于近期波动与期权活跃度的代理指标，非真实历史 IV Rank。生产环境建议接入 IVolatility / ORATS / CBOE 等期权数据。
- 当前未覆盖全市场 ~数千只期权标的，而是聚焦流动性最好的一批，避免免费数据源限流与噪声。
- 策略推荐为规则引擎，仅供教育与研究参考，不构成投资建议。

## 后续可扩展

- 接入真实 IV Rank / IV Percentile
- 显示具体行权价与到期日建议
- 连接 IBKR 下单指令
- 用户自定义观察列表与提醒
