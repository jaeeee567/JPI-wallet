# JPI Wallet

A modern, user-friendly wallet application for the Pi Network cryptocurrency.

## Features

- **Wallet Management**: Create and import wallets using private keys or seed phrases
- **Send & Receive Pi**: Easily transfer Pi to other users
- **Transaction History**: View your complete transaction history
- **QR Code Generation**: Generate QR codes for easy Pi transfers
- **Secure Storage**: Your wallet information is securely stored locally

## Tech Stack

- React
- TypeScript
- Vite
- TailwindCSS
- Lucide React (for icons)

## Development

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/jpi-wallet.git
   cd jpi-wallet
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Start the development server
   ```
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## Building for Production

```
npm run build
```

The built files will be in the `dist` directory.

## Deployment

This project is configured for easy deployment to Netlify. Simply connect your GitHub repository to Netlify, and it will automatically deploy when you push changes to the main branch.

## License

MIT
