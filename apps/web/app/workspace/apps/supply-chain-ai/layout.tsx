import { SupplyChainShell } from './components/SupplyChainShell';
import styles from './supply-chain-shell.module.css';

export default function SupplyChainLayout({ children }: { children: React.ReactNode }) {
  return <SupplyChainShell>{children}</SupplyChainShell>;
}
