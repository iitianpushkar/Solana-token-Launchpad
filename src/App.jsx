import './App.css'
import { TokenLaunchpad } from './components/tokenlaunchpad'

import {ConnectionProvider,WalletProvider} from '@solana/wallet-adapter-react'
import {WalletModalProvider, WalletDisconnectButton,WalletMultiButton} from '@solana/wallet-adapter-react-ui'
import '@solana/wallet-adapter-react-ui/styles.css'

function App() {
  return (
<div>
  <ConnectionProvider endpoint={"https://api.devnet.solana.com"}>
  <WalletProvider wallets={[]} autoConnect>
    <WalletModalProvider>
      <WalletMultiButton />
      <WalletDisconnectButton />
    <TokenLaunchpad></TokenLaunchpad>
    </WalletModalProvider>
  </WalletProvider>
   </ConnectionProvider>

</div>
    
  )
}

export default App