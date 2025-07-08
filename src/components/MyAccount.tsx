
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Wallet, ArrowUpRight, ArrowDownLeft, Bitcoin, DollarSign, CreditCard, Banknote } from "lucide-react";
import { PaymentModal } from "./PaymentModal";

export const MyAccount = () => {
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [balance, setBalance] = useState(1000);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentType, setPaymentType] = useState<'deposit' | 'withdraw'>('deposit');
  const [amount, setAmount] = useState('');

  const handleDeposit = (method: string) => {
    setPaymentType('deposit');
    setShowPaymentModal(true);
  };

  const handleWithdraw = (method: string) => {
    setPaymentType('withdraw');
    setShowPaymentModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-900 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              My Account
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Manage your wallet and transactions
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Wallet Balance */}
          <Card className="bg-slate-800/50 border-cyan-500/20 p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <Wallet className="h-8 w-8 text-cyan-400" />
                <div>
                  <h2 className="text-2xl font-bold text-white">Wallet Balance</h2>
                  <p className="text-gray-400">
                    {isDemoMode ? 'Demo Account' : 'Real Account'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-cyan-400 mb-2">
                  ${balance.toFixed(2)} USDT
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  isDemoMode 
                    ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' 
                    : 'bg-green-500/20 text-green-400 border border-green-500/30'
                }`}>
                  {isDemoMode ? 'DEMO MODE' : 'REAL MONEY'}
                </div>
              </div>
            </div>

            {/* Mode Toggle */}
            <div className="flex justify-center mb-6">
              <div className="bg-slate-700/50 rounded-lg p-1 flex">
                <Button
                  variant={isDemoMode ? "default" : "ghost"}
                  onClick={() => setIsDemoMode(true)}
                  className={`${isDemoMode ? 'bg-yellow-500 text-black' : 'text-gray-400'}`}
                >
                  Demo Mode
                </Button>
                <Button
                  variant={!isDemoMode ? "default" : "ghost"}
                  onClick={() => setIsDemoMode(false)}
                  className={`${!isDemoMode ? 'bg-green-500 text-black' : 'text-gray-400'}`}
                >
                  Real Money
                </Button>
              </div>
            </div>
          </Card>

          {/* Deposit/Withdraw Options */}
          {!isDemoMode && (
            <div className="grid md:grid-cols-2 gap-8">
              
              {/* Deposit */}
              <Card className="bg-slate-800/50 border-cyan-500/20 p-6">
                <div className="flex items-center mb-6">
                  <ArrowDownLeft className="h-6 w-6 text-green-400 mr-3" />
                  <h3 className="text-xl font-bold text-white">Deposit Funds</h3>
                </div>

                <div className="space-y-4">
                  <Button
                    onClick={() => handleDeposit('usdt')}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
                  >
                    <Bitcoin className="h-5 w-5 mr-2" />
                    Deposit USDT (Crypto)
                  </Button>
                  
                  <Button
                    onClick={() => handleDeposit('card')}
                    variant="outline"
                    className="w-full border-slate-600 text-gray-300 py-3"
                  >
                    <CreditCard className="h-5 w-5 mr-2" />
                    Credit/Debit Card
                  </Button>
                  
                  <Button
                    onClick={() => handleDeposit('bank')}
                    variant="outline"
                    className="w-full border-slate-600 text-gray-300 py-3"
                  >
                    <Banknote className="h-5 w-5 mr-2" />
                    Bank Transfer
                  </Button>
                </div>
              </Card>

              {/* Withdraw */}
              <Card className="bg-slate-800/50 border-cyan-500/20 p-6">
                <div className="flex items-center mb-6">
                  <ArrowUpRight className="h-6 w-6 text-cyan-400 mr-3" />
                  <h3 className="text-xl font-bold text-white">Withdraw Funds</h3>
                </div>

                <div className="space-y-4">
                  <Button
                    onClick={() => handleWithdraw('usdt')}
                    className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-3"
                    disabled={balance <= 0}
                  >
                    <Bitcoin className="h-5 w-5 mr-2" />
                    Withdraw USDT (Crypto)
                  </Button>
                  
                  <Button
                    onClick={() => handleWithdraw('bank')}
                    variant="outline"
                    className="w-full border-slate-600 text-gray-300 py-3"
                    disabled={balance <= 0}
                  >
                    <Banknote className="h-5 w-5 mr-2" />
                    Bank Transfer
                  </Button>

                  <p className="text-sm text-gray-400 text-center">
                    Minimum withdrawal: $10 USDT
                  </p>
                </div>
              </Card>
            </div>
          )}

          {/* Demo Mode Message */}
          {isDemoMode && (
            <Card className="bg-yellow-500/10 border-yellow-500/30 p-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-yellow-400 mb-2">
                  Demo Mode Active
                </h3>
                <p className="text-gray-300">
                  You're currently in demo mode. Switch to real money mode to access deposit and withdrawal options.
                  Demo funds cannot be withdrawn.
                </p>
              </div>
            </Card>
          )}

          {/* Recent Transactions */}
          <Card className="bg-slate-800/50 border-cyan-500/20 p-6">
            <h3 className="text-xl font-bold text-white mb-4">Recent Transactions</h3>
            <div className="space-y-3">
              {isDemoMode ? (
                <p className="text-gray-400 text-center py-8">
                  No transactions in demo mode
                </p>
              ) : (
                <p className="text-gray-400 text-center py-8">
                  No recent transactions
                </p>
              )}
            </div>
          </Card>
        </div>
      </div>

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        type={paymentType}
        amount={amount}
        onAmountChange={setAmount}
      />
    </div>
  );
};
