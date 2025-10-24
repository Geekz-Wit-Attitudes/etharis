![ETHARIS](frontend/public/etharis-logo.png)

# ETHARIS

**Trustless Deals, Guaranteed Results.**

Etharis is a smart contract escrow infrastructure for Indonesia's sponsorship marketplace, eliminating fraud risks and payment delays between Brands (especially SMEs) and Content Creators.

## 🎯 The Problem

The Indonesian creator economy faces a critical trust crisis:

- **Creators** experience rampant payment delays and ghosting, working without effective contract guarantees
- **Brands** bear financial risk if content doesn't match the brief or gets deleted after payment
- **Micro-deals** (< Rp 5 Million) are underserved by existing agency/platform solutions due to high costs

## 💡 The Solution

Etharis functions as an **"Automatic Notary"** using smart contracts as a trustless escrow mechanism:

- **Guaranteed Funds**: Brand funds are converted to IDRX stablecoin and locked on-chain immediately after Rupiah payment
- **Assured Results**: Funds only release when contract conditions are verified, ensuring creators get paid and brands get content
- **Zero Crypto Friction**: Users interact with email/password login - blockchain complexity is completely hidden

## 🏗️ Technical Architecture

### Tech Stack

- **Runtime**: Bun
- **Framework**: Hono
- **Database**: Prisma ORM
- **Blockchain**: Base Sepolia Testnet
- **Smart Contracts**: Solidity 0.8+
- **Storage**: Minio S3 (for briefs)
- **Security**: HashiCorp Vault (private key management)
- **Stablecoin**: IDRX Integration

### Key Technical Features

#### 1. Zero Crypto Friction UX

- **Custodial Wallet**: Auto-generated smart wallets with email/password login
- **Zero Gas Fees**: All on-chain transaction costs subsidized by Etharis server wallet
- **Fiat On-Ramp**: Seamless Rupiah → IDRX conversion via API

#### 2. Security & Integrity

- **Brief Integrity**: SHA-256 hashing ensures briefs cannot be manipulated after contract creation
- **Vault Security**: Private keys isolated in HashiCorp Vault
- **On-Chain Dispute Logic**: Conflict resolution coded directly in smart contracts

#### 3. Smart Contract Quality

- Strict access controls to prevent exploitation
- Reentrancy protection for fund security
- Pausable emergency stop mechanism
- Custom errors for gas efficiency
- Gasless funding with off-chain signatures
- SafeERC20 implementation for secure IDRX transactions

## 🚀 Getting Started

### Prerequisites

- Bun v1.0+
- PostgreSQL
- Minio S3 (or S3-compatible storage)
- HashiCorp Vault

### Installation

1.  **Clone the repository and navigate to the project root:**

    ```bash
    git clone https://github.com/Geekz-Wit-Attitudes/etharis.git
    cd etharis
    ```

2.  **Configure Environment Variables:**

    ```bash
    # Set up environment variables in both services
    cp backend/.env.example backend/.env
    cp frontend/.env.example frontend/.env
    ```

    _Edit the new `.env` files in both directories to set your `DATABASE_URL` and other secrets._

3.  **Install Dependencies:**

    ```bash
    cd frontend && bun install && cd ../backend && bun install
    ```

4.  **Database Setup**

    From the project root, run the following commands to configure your database and generate the client:

    ```bash
    bunx prisma migrate dev # Apply migrations
    bunx prisma generate    # Generate type-safe client
    ```

5.  **Run Services**

    You'll need **two separate terminal windows** to run the backend and frontend simultaneously.

    **Terminal 1: Run Backend (API)**

    ```bash
    # from root folder
    cd backend

    # There is two option to run the services 
    
    # docker approach (since we need minio s3)
    docker compose up --build

    # OR

    # only services without minio s3
    bun run src/index.ts
    ```
    *The API will be available at the address specified (e.g., `http://localhost:3001`).*

    **Terminal 2: Run Frontend**

    ```bash
    # from root folder
    cd frontend
    bun run dev
    ```
    *The frontend should open in your browser, typically at `http://localhost:3000`.*

---

## 👥 Team

**Geekz With Attitude**

- [@dimsp4](https://github.com/dimsp4)
- [@0x1m4o](https://github.com/0x1m4o)

## 📞 Contact

- Email: [etharis.prod@gmail.com](mailto:etharis.prod@gmail.com)

## **License**

This project is licensed under the MIT License.
