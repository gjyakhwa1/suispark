# 🚩 Overview
SuiSpark is an AI-driven funding platform leveraging SUI blockchain and multi-agent collaboration to evaluate and support innovative project ideas. Users submit their pitches with a small SUI token fee (0.01SUI), engaging in an AI-led interactive questioning process to evaluate proposals. Three specialized AI agents with different field of expertise assess submissions based on SUI relevance, business potential, and technical feasibility respectively, requiring at least two approvals for funding. Once approved by the agents , the project is funded with 0.05 SUI.

# ✨ Features
Key features includes
- zkLogin-based wallet integration
- Evaluation of proposal by AI Agents
- Smart contract-managed fund distribution
- Duplicate proposal detection
- Collaborative decision-making by agents.

# 🎞️ Demo Video
https://youtu.be/xAOIkbUY1Z4

# 🚀 Installation
**Prerequisites**
- [Python 2.7+](https://www.python.org/)
- [Node.js 23+](https://nodejs.org/)
- [pnpm](https://pnpm.io/)

> **Note for Windows Users:** [WSL 2](https://learn.microsoft.com/en-us/windows/wsl/) is required.


**Edit the .env file**
```
cp .env.example .env
```
>Note: You need to replace the placeholders with your actual values on both `suispark-backend` and `suispark-frontend`

**suispark-backend**

All the code related to creating AI agents using Eliza OS and Atoma Network for the inference.

Framework: Node.js, Expressjs
```
cd suispark-backend
pnpm install
pnpm run dev
```
**suispark-frontend**

Framework: ReactJS
```
cd suispark-frontend
yarn install
yarn run dev
```
**suispark-contracts**

Framework: SUI Move
```
For deployment

cd suispark-contracts
npx ts-node scripts/utils/setup.ts
```