import React from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  BrainCircuit, 
  CreditCard, 
  ArrowRight, 
  Globe, 
  Zap, 
  Cpu 
} from 'lucide-react';
import Navbar from './components/layout/Navbar';


const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1020] via-[#16213e] to-[#1a1a2e] text-white">
      <Navbar />
      
      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-600">
              Optimize Your DeFi Portfolio
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Floquidity is your AI-powered DeFi co-pilot, helping you maximize yields and manage assets across multiple chains seamlessly.
            </p>
            <div className="flex space-x-4">
              <Link 
                href="/dashboard" 
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-6 py-3 rounded-full flex items-center gap-2 transition-all duration-300 transform hover:scale-105"
              >
                Launch App
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link 
                href="#features" 
                className="border border-cyan-400 text-cyan-400 hover:bg-cyan-500 hover:text-white px-6 py-3 rounded-full flex items-center gap-2 transition-all duration-300"
              >
                Learn More
              </Link>
            </div>
          </div>
          
          {/* Animated Illustration Placeholder */}
          <div className="hidden md:block relative">
            <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 absolute inset-0 rounded-full blur-3xl animate-pulse"></div>
            <div className="relative z-10 bg-[#16213e]/50 rounded-2xl p-8 backdrop-blur-lg">
              <div className="space-y-4">
                <div className="flex items-center space-x-4 bg-[#1a1a2e] p-4 rounded-xl">
                  <Globe className="text-cyan-400 w-10 h-10" />
                  <div>
                    <h3 className="font-semibold text-lg">Cross-Chain Portfolio</h3>
                    <p className="text-gray-400 text-sm">Unified view across Ethereum, Arbitrum, and more</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 bg-[#1a1a2e] p-4 rounded-xl">
                  <BrainCircuit className="text-blue-400 w-10 h-10" />
                  <div>
                    <h3 className="font-semibold text-lg">AI Strategy Engine</h3>
                    <p className="text-gray-400 text-sm">Intelligent yield optimization recommendations</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 bg-[#1a1a2e] p-4 rounded-xl">
                  <CreditCard className="text-green-400 w-10 h-10" />
                  <div>
                    <h3 className="font-semibold text-lg">MetaMask Card</h3>
                    <p className="text-gray-400 text-sm">Spend DeFi earnings with smart limits</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <section id="features" className="mt-24">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-600">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Floquidity combines cutting-edge AI with blockchain technology to revolutionize your DeFi experience.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-[#16213e] p-6 rounded-2xl hover:shadow-2xl hover:shadow-cyan-500/20 transition-all duration-300">
              <Zap className="w-12 h-12 text-cyan-400 mb-4" />
              <h3 className="text-xl font-semibold mb-3">Cross-Chain Visibility</h3>
              <p className="text-gray-400">
                Instantly view and manage assets across Ethereum, Arbitrum, Optimism, and Linea in one unified dashboard.
              </p>
            </div>
            <div className="bg-[#16213e] p-6 rounded-2xl hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300">
              <Cpu className="w-12 h-12 text-blue-400 mb-4" />
              <h3 className="text-xl font-semibold mb-3">AI Strategy Recommendations</h3>
              <p className="text-gray-400">
                Leverage AI-powered insights to optimize your yield strategies and maximize portfolio performance.
              </p>
            </div>
            <div className="bg-[#16213e] p-6 rounded-2xl hover:shadow-2xl hover:shadow-green-500/20 transition-all duration-300">
              <CreditCard className="w-12 h-12 text-green-400 mb-4" />
              <h3 className="text-xl font-semibold mb-3">MetaMask Card Integration</h3>
              <p className="text-gray-400">
                Set intelligent spending limits based on your DeFi earnings and manage real-world expenses seamlessly.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;