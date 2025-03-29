'use client'

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Wallet, 
  LayoutDashboard, 
  BrainCircuit, 
  CreditCard 
} from 'lucide-react';
import { SiRoboflow } from "react-icons/si";
import { useAccount, useConnect, useDisconnect } from 'wagmi';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const { connector: activeConnector, isConnected, address } = useAccount();
  const { connect, connectors, error } = useConnect();
  const { disconnect } = useDisconnect();
 
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleWalletConnection = () => {
    const connector = connectors[0];
    connect({ connector });
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <nav className="bg-gradient-to-r from-[#1a1a2e] to-[#16213e] text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center ">
            <Link href="/" className="flex items-center gap-2">
            <SiRoboflow className='text-[30px] text-cyan-400'/>
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-600">
                Floquidity
              </span>
            </Link>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white hover:text-cyan-400 focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              <Link 
                href="/dashboard" 
                className="text-white hover:bg-blue-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors duration-300"
              >
                <LayoutDashboard className="w-5 h-5" />
                Dashboard
              </Link>
              <Link 
                href="/strategies" 
                className="text-white hover:bg-blue-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors duration-300"
              >
                <BrainCircuit className="w-5 h-5" />
                AI Strategies
              </Link>
              {/* <Link 
                href="/card" 
                className="text-white hover:bg-blue-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors duration-300"
              >
                <CreditCard className="w-5 h-5" />
                MetaMask Card
              </Link> */}
              {isClient && isConnected ? (
                <div className="flex items-center space-x-2">
                  <span className="bg-[#16213e] px-3 py-2 rounded-full text-sm">
                    {formatAddress(address || '')}
                  </span>
                  <button 
                    onClick={() => disconnect()}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-all duration-300"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <button 
                  onClick={handleWalletConnection}
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-all duration-300 transform hover:scale-105"
                >
                  <Wallet className="w-5 h-5" />
                  Connect Wallet
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-[#16213e]">
            <Link 
              href="/dashboard" 
              className="text-white hover:bg-blue-700 block px-3 py-2 rounded-md text-base font-medium flex items-center gap-2"
            >
              <LayoutDashboard className="w-5 h-5" />
              Dashboard
            </Link>
            <Link 
              href="/strategies" 
              className="text-white hover:bg-blue-700 block px-3 py-2 rounded-md text-base font-medium flex items-center gap-2"
            >
              <BrainCircuit className="w-5 h-5" />
              AI Strategies
            </Link>
            {/* <Link 
              href="/card" 
              className="text-white hover:bg-blue-700 block px-3 py-2 rounded-md text-base font-medium flex items-center gap-2"
            >
              <CreditCard className="w-5 h-5" />
              MetaMask Card
            </Link> */}
            {isClient && isConnected ? (
              <div className="space-y-2">
                <span className="block bg-[#1a1a2e] text-center px-3 py-2 rounded-md text-sm">
                  {formatAddress(address || '')}
                </span>
                <button 
                  onClick={() => disconnect()}
                  className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full text-sm font-bold"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button 
                onClick={handleWalletConnection}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center justify-center gap-2 transition-all duration-300"
              >
                <Wallet className="w-5 h-5" />
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;