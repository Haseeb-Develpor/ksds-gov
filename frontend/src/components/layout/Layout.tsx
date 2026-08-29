import { ReactNode } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import LiveChat from '../common/LiveChat';
import WhatsAppButton from '../common/WhatsAppButton';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsAppButton />
      <LiveChat />
    </div>
  );
}
