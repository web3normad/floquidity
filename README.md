# Floquidity: AI-Powered DeFi Co-Pilot

![Floquidity Logo](public/assets/images/logo.png)

## Overview

Floquidity is an intelligent assistant that helps users optimize their DeFi portfolio across multiple chains. It provides cross-chain portfolio visibility, AI-driven strategy recommendations, and smart rebalancing tools to maximize yield while managing risk.

## 🌍 DeFi Complexities & How Floquidity Solves Them

### The Problem: DeFi Complexity and Fragmentation

Decentralized Finance (DeFi) offers tremendous opportunities but presents significant challenges:

- **Fragmented Liquidity**: Assets scattered across multiple blockchains make portfolio tracking and optimization difficult
- **Protocol Risk Assessment**: Varying security levels, audit statuses, and risk parameters require deep understanding
- **Yield Strategy Comparison**: Comparing APYs across chains and protocols is challenging
- **Impermanent Loss Management**: Determining optimal times for liquidity provision is complex
- **Rebalancing Timing**: Knowing when to shift assets between chains and protocols for best returns is difficult
- **Gas Fee Optimization**: Transaction costs vary widely across networks

### The Solution: Floquidity

Floquidity is an **AI-powered DeFi co-pilot** designed to simplify cross-chain portfolio management:

1. **AI Strategy Assistant**
   - Analyzes on-chain data to recommend optimal yield farming, lending, and liquidity strategies
   - Monitors market conditions and suggests automated rebalancing
   - Translates complex DeFi opportunities into simple, actionable steps

2. **Cross-Chain Asset Dashboard**
   - Provides unified portfolio overview across Ethereum, Arbitrum, Optimism, and Linea
   - Delivers real-time risk assessment scoring for protocols and positions
   - Offers detailed performance analytics and tracking

## 🚀 Features

- **Cross-Chain Portfolio Visibility**: Unified dashboard showing assets across Ethereum, Arbitrum, Optimism, and Linea testnets
- **AI Strategy Recommendations**: Actionable insights for yield optimization with risk assessment
- **Impermanent Loss Calculator**: Tools to help users understand and mitigate impermanent loss risks
- **Rebalancing Strategies**: Smart rebalancing recommendations to optimize portfolio allocation
- **Linea Blockchain Integration**: Full support for Linea network assets and protocols

## 🏗️ Project Structure

```
Floquidity/
│
├── frontend/
│   ├── public/
│   │   └── assets/
│   │       └── images/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Button.jsx
│   │   │   │   └── LoadingSpinner.jsx
│   │   │   ├── dashboard/
│   │   │   │   ├── AssetOverview.jsx
│   │   │   │   └── PortfolioChart.jsx
│   │   │   ├── ai-strategy/
│   │   │   │   └── StrategyCard.jsx
│   │   │   ├── strategies/
│   │   │   │   ├── ImpermanentLossCalculator.tsx
│   │   │   │   └── RebalancingStrategyModal.tsx
│   │   │   └── layout/
│   │   │       ├── Navbar.jsx
│   │   │       └── Footer.jsx
│   │   ├── hooks/
│   │   │   ├── usePortfolio.js
│   │   │   ├── useImpermanentLossCalculator.ts
│   │   │   └── useRebalancingStrategy.ts
│   │   ├── context/
│   │   │   └── Web3Context.jsx
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── ai.js
│   │   │   ├── impermanentLossService.ts
│   │   │   └── rebalancingService.ts
│   │   ├── types/
│   │   │   ├── ImpermanentLoss.ts
│   │   │   └── RebalancingStrategy.ts
│   │   ├── utils/
│   │   │   ├── formatters.js
│   │   │   └── constants.js
│   │   ├── pages/
│   │   │   ├── _app.jsx
│   │   │   ├── index.jsx
│   │   │   ├── dashboard.jsx
│   │   │   └── strategies.jsx
│   │   └── styles/
│   │       └── globals.css
│   ├── .env.local
│   └── package.json
│
├── contracts/
│   ├── DeFiNaviDemo.sol
│   ├── deploy.js
│   └── package.json
│
├── .gitignore
└── README.md
```

## 🛠️ Tech Stack

### Frontend
- **Web3 Integration**: wagmi/viem for wallet connection
- **Wallet Support**: MetaMask integration
- **Price Data**: CoinGecko API
- **AI Integration**: OpenAI API

### Smart Contracts
- **Language**: Solidity
- **Network Support**: Ethereum, Arbitrum, Optimism, and Linea

## 🔧 Setup & Installation

### Prerequisites
- Node.js v16+
- Yarn or npm
- MetaMask or other Web3 wallet

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/web3normad/floquidity.git
   cd floquidity
   ```

2. Install dependencies for the frontend
   ```bash
   cd frontend
   yarn install
   ```

3. Set up environment variables
   Create a `.env.local` file in the frontend directory with the following variables:
   ```
   NEXT_PUBLIC_ETHEREUM_RPC_URL=your_ethereum_rpc_url
   NEXT_PUBLIC_ARBITRUM_RPC_URL=your_arbitrum_rpc_url
   NEXT_PUBLIC_OPTIMISM_RPC_URL=your_optimism_rpc_url
   NEXT_PUBLIC_LINEA_RPC_URL=your_linea_rpc_url
   NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key
   NEXT_PUBLIC_COINGECKO_API_KEY=your_coingecko_api_key
   ```

4. Start the development server
   ```bash
   yarn dev
   ```

5. Open your browser and navigate to `http://localhost:3000`

## 📱 Usage

### Portfolio Dashboard

The dashboard provides a comprehensive view of your assets across multiple chains:

- Total portfolio value
- Chain distribution visualization
- Performance metrics (+/-% in 24h)
- Asset breakdown

### AI Strategy Recommendations

Browse and filter AI-generated yield strategies:

- Filter by chain and risk level
- View expected APY and AI confidence scores
- Get detailed strategy explanations and implementation steps

### Impermanent Loss Calculator

Calculate potential impermanent loss for liquidity positions:

- Input token pair and price change scenarios
- View graphical representation of IL impact
- Get mitigation recommendations

### Rebalancing Strategies

Optimize your portfolio allocation:

- Get AI-recommended rebalancing suggestions
- View potential yield improvements
- Execute rebalancing with one click

### Linea Integration

Floquidity features deep integration with the Linea blockchain:

- Complete visibility of Linea assets in portfolio dashboard
- Linea-specific yield strategies and opportunities
- Support for Linea's DeFi protocols and tokens
- Optimized gas usage for Linea transactions

## 🚀 Roadmap

- [ ] Expand chain support to include more networks
- [ ] Enhance AI models with custom training
- [ ] Implement advanced portfolio analytics and tax reporting
- [ ] Add liquidity concentration visualizations
- [ ] Implement dynamic rebalancing suggestions
- [ ] Integrate detailed protocol risk metrics
- [ ] Add real-time APY updates

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- [Linea Blockchain](https://linea.build/)
- [wagmi](https://wagmi.sh/) & [viem](https://viem.sh/)
- [MetaMask](https://metamask.io/)
- [CoinGecko API](https://www.coingecko.com/en/api/documentation)
- [OpenAI API](https://platform.openai.com/docs/)
