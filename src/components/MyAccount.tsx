import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Wallet, ArrowUpRight, ArrowDownLeft, DollarSign, CreditCard, Banknote, Clock, TrendingUp, LogOut, Gift, Copy, Check } from "lucide-react";
import { EnhancedPaymentModal } from "./EnhancedPaymentModal";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { Progress } from "@/components/ui/progress";

interface Transaction {
  id: string;
  type: string;
  amount: number;
  created_at: string;
  description?: string | null;
  status?: string;
}

export const MyAccount = () => {
  const { user, userProfile, loading, signOut, refreshProfile, balance, username } = useAuth();
  const { t } = useLanguage();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentType, setPaymentType] = useState<'deposit' | 'withdraw'>('deposit');
  const [amount, setAmount] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [referralCode, setReferralCode] = useState('');
  const [qualifiedReferrals, setQualifiedReferrals] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (user) {
      fetchTransactions();
      fetchReferralInfo();
    }
  }, [user]);

  const fetchTransactions = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) { console.error('Error fetching transactions:', error); return; }
      setTransactions(data || []);
    } catch (error) { console.error('Error fetching transactions:', error); }
  };

  const fetchReferralInfo = async () => {
    if (!user) return;
    try {
      // Get user's referral code
      const { data: userData } = await supabase
        .from('users')
        .select('referral_code')
        .eq('id', user.id)
        .single();
      if (userData?.referral_code) setReferralCode(userData.referral_code);

      // Get qualified referral count
      const { data: referralData, error } = await supabase
        .from('referrals')
        .select('id')
        .eq('referrer_id', user.id)
        .eq('deposit_made', true)
        .eq('reward_paid', false);
      if (!error && referralData) setQualifiedReferrals(referralData.length);
    } catch (error) { console.error('Error fetching referral info:', error); }
  };

  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    toast({ title: t('referral.copied') });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDeposit = () => { setPaymentType('deposit'); setShowPaymentModal(true); };
  const handleWithdraw = () => { setPaymentType('withdraw'); setShowPaymentModal(true); };

  const handleSignOut = async () => {
    const success = await signOut();
    if (success) {
      toast({ title: t('account.signedOut'), description: t('account.signedOutDesc') });
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit': return <ArrowDownLeft className="h-4 w-4 text-green-400" />;
      case 'withdrawal': return <ArrowUpRight className="h-4 w-4 text-cyan-400" />;
      case 'bet': return <DollarSign className="h-4 w-4 text-red-400" />;
      case 'win': return <TrendingUp className="h-4 w-4 text-green-400" />;
      default: return <DollarSign className="h-4 w-4 text-gray-400" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'deposit': case 'win': return 'text-green-400';
      case 'withdrawal': case 'bet': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-900 flex items-center justify-center">
        <div className="text-cyan-400 text-xl">{t('history.loading')}</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">{t('account.signIn')}</h2>
          <p className="text-gray-400">{t('account.signInDesc')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-900 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              {t('account.title')}
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">{t('account.subtitle')}</p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          <Card className="bg-slate-800/50 border-cyan-500/20 p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <Wallet className="h-8 w-8 text-cyan-400" />
                <div>
                  <h2 className="text-2xl font-bold text-white">{t('account.walletBalance')}</h2>
                  <p className="text-gray-400">
                    {username ? `${t('account.welcome')}, ${username}` : t('account.realAccount')}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-4xl font-bold text-cyan-400 mb-2">${balance.toFixed(2)} USDT</div>
                  <div className="bg-green-500/20 text-green-400 border border-green-500/30 px-3 py-1 rounded-full text-sm font-semibold">
                    {t('account.realMoney')}
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={handleSignOut} className="border-red-500/30 text-red-400 hover:bg-red-500/20">
                  <LogOut className="h-4 w-4 mr-2" />
                  {t('account.signOut')}
                </Button>
              </div>
            </div>
          </Card>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="bg-slate-800/50 border-cyan-500/20 p-6">
              <div className="flex items-center mb-6">
                <ArrowDownLeft className="h-6 w-6 text-green-400 mr-3" />
                <h3 className="text-xl font-bold text-white">{t('account.depositFunds')}</h3>
              </div>
              <div className="space-y-4">
                <Button onClick={handleDeposit} className="w-full bg-green-600 hover:bg-green-700 text-white py-3">
                  <Wallet className="h-5 w-5 mr-2" />
                  {t('account.depositCrypto')}
                </Button>
                <Button variant="outline" className="w-full border-slate-600 text-gray-500 py-3 cursor-not-allowed" disabled>
                  <CreditCard className="h-5 w-5 mr-2" />
                  {t('account.creditCard')} — N/A
                </Button>
                <Button variant="outline" className="w-full border-slate-600 text-gray-500 py-3 cursor-not-allowed" disabled>
                  <Banknote className="h-5 w-5 mr-2" />
                  {t('account.bankTransfer')} — N/A
                </Button>
              </div>
            </Card>

            <Card className="bg-slate-800/50 border-cyan-500/20 p-6">
              <div className="flex items-center mb-6">
                <ArrowUpRight className="h-6 w-6 text-cyan-400 mr-3" />
                <h3 className="text-xl font-bold text-white">{t('account.withdrawFunds')}</h3>
              </div>
              <div className="space-y-4">
                <Button onClick={handleWithdraw} className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-3" disabled={balance <= 0}>
                  <Wallet className="h-5 w-5 mr-2" />
                  {t('account.withdrawCrypto')}
                </Button>
                <Button variant="outline" className="w-full border-slate-600 text-gray-500 py-3 cursor-not-allowed" disabled>
                  <Banknote className="h-5 w-5 mr-2" />
                  {t('account.bankTransfer')} — N/A
                </Button>
                <p className="text-sm text-gray-400 text-center">{t('account.minWithdraw')}</p>
              </div>
            </Card>
          </div>

          {/* Referral Program Card */}
          <Card className="bg-gradient-to-r from-purple-900/30 to-cyan-900/30 border-purple-500/20 p-6">
            <div className="flex items-center mb-4">
              <Gift className="h-6 w-6 text-purple-400 mr-3" />
              <h3 className="text-xl font-bold text-white">{t('referral.title')}</h3>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-400 mb-3">{t('referral.yourCode')}</p>
                <div className="flex items-center space-x-2 mb-4">
                  <div className="bg-slate-800 border border-purple-500/30 rounded-lg px-4 py-3 font-mono text-lg text-purple-300 tracking-widest flex-1 text-center">
                    {referralCode || '...'}
                  </div>
                  <Button onClick={copyReferralCode} variant="outline" size="sm" className="border-purple-500/30 text-purple-400 hover:bg-purple-500/20">
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-gray-500">{t('referral.share')}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-400 mb-2">{t('referral.progress')}</p>
                <div className="mb-2">
                  <Progress value={(qualifiedReferrals % 10) * 10} className="h-3" />
                </div>
                <p className="text-sm text-purple-300 font-medium">
                  {qualifiedReferrals % 10}/10 {t('referral.qualified')}
                </p>
                <div className="mt-4 space-y-1">
                  <p className="text-xs text-gray-500">💡 {t('referral.howItWorks')}</p>
                  <p className="text-xs text-gray-400">1. {t('referral.step1')}</p>
                  <p className="text-xs text-gray-400">2. {t('referral.step2')}</p>
                  <p className="text-xs text-gray-400">3. {t('referral.step3')}</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-slate-800/50 border-cyan-500/20 p-6">
            <h3 className="text-xl font-bold text-white mb-4">{t('account.recentTransactions')}</h3>
            <div className="space-y-3">
              {transactions.length === 0 ? (
                <p className="text-gray-400 text-center py-8">{t('account.noTransactions')}</p>
              ) : (
                transactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getTransactionIcon(transaction.type)}
                      <div>
                        <div className="text-white font-medium capitalize">{transaction.type}</div>
                        <div className="text-gray-400 text-sm flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {new Date(transaction.created_at).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-bold ${getTransactionColor(transaction.type)}`}>
                        {transaction.type === 'deposit' || transaction.type === 'win' ? '+' : ''}${transaction.amount.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-400">{transaction.description || transaction.status || 'Completed'}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>

      <EnhancedPaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        type={paymentType}
        amount={amount}
        onAmountChange={setAmount}
      />
    </div>
  );
};
