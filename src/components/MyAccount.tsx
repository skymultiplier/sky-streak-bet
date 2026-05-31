import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Wallet, ArrowUpRight, ArrowDownLeft, DollarSign, CreditCard, Banknote, Clock, TrendingUp, TrendingDown, LogOut, Gift, Copy, Check, Activity, Trophy, Share2 } from "lucide-react";
import { EnhancedPaymentModal } from "./EnhancedPaymentModal";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { Progress } from "@/components/ui/progress";
import { useSearchParams } from "react-router-dom";

interface Transaction {
  id: string;
  type: string;
  amount: number;
  created_at: string;
  description?: string | null;
  status?: string;
}

export const MyAccount = () => {
  const { user, loading, signOut, balance, username } = useAuth();
  const { t } = useLanguage();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentType, setPaymentType] = useState<'deposit' | 'withdraw'>('deposit');
  const [amount, setAmount] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [referralCode, setReferralCode] = useState('');
  const [qualifiedReferrals, setQualifiedReferrals] = useState(0);
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState({
    totalDeposits: 0,
    totalWithdrawals: 0,
    totalBets: 0,
    totalWins: 0,
    betCount: 0,
    winCount: 0,
  });

  useEffect(() => {
    if (user) {
      fetchTransactions();
      fetchReferralInfo();
      fetchStats();
    }
  }, [user]);

  const fetchTransactions = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);
    setTransactions(data || []);
  };

  const fetchStats = async () => {
    if (!user) return;
    const { data: tx } = await supabase
      .from('transactions')
      .select('type, amount')
      .eq('user_id', user.id);
    const { data: bets } = await supabase
      .from('bets')
      .select('amount, profit, status')
      .eq('user_id', user.id);

    let totalDeposits = 0, totalWithdrawals = 0, totalWins = 0, totalBets = 0, winCount = 0, betCount = 0;
    (tx || []).forEach((t: any) => {
      const a = Number(t.amount) || 0;
      if (t.type === 'deposit') totalDeposits += a;
      if (t.type === 'withdrawal') totalWithdrawals += a;
    });
    (bets || []).forEach((b: any) => {
      betCount += 1;
      totalBets += Number(b.amount) || 0;
      if (b.status === 'won' || (b.profit && Number(b.profit) > 0)) {
        winCount += 1;
        totalWins += Number(b.profit) || 0;
      }
    });
    setStats({ totalDeposits, totalWithdrawals, totalBets, totalWins, betCount, winCount });
  };

  const fetchReferralInfo = async () => {
    if (!user) return;
    const { data: userData } = await supabase
      .from('users')
      .select('referral_code')
      .eq('id', user.id)
      .single();
    if (userData?.referral_code) setReferralCode(userData.referral_code);

    const { data: referralData } = await supabase
      .from('referrals')
      .select('id')
      .eq('referrer_id', user.id)
      .eq('deposit_made', true)
      .eq('reward_paid', false);
    if (referralData) setQualifiedReferrals(referralData.length);
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
    if (success) toast({ title: t('account.signedOut'), description: t('account.signedOutDesc') });
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
    if (type === 'deposit' || type === 'win') return 'text-green-400';
    if (type === 'withdrawal' || type === 'bet') return 'text-red-400';
    return 'text-gray-400';
  };

  const winRate = stats.betCount > 0 ? Math.round((stats.winCount / stats.betCount) * 100) : 0;
  const netProfit = stats.totalWins - stats.totalBets;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-cyan-400 text-xl">{t('history.loading')}</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">{t('account.signIn')}</h2>
          <p className="text-gray-400">{t('account.signInDesc')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 text-white">
            {t('account.title')}
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">{t('account.subtitle')}</p>
        </div>

        <div className="max-w-5xl mx-auto space-y-6">
          {/* Balance Header */}
          <Card className="bg-slate-800 border-cyan-500/20 p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="h-14 w-14 rounded-full bg-cyan-600 flex items-center justify-center">
                  <Wallet className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{t('account.walletBalance')}</h2>
                  <p className="text-gray-400 text-sm">
                    {username ? `${t('account.welcome')}, ${username}` : t('account.realAccount')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-3xl md:text-4xl font-bold text-cyan-400">${balance.toFixed(2)}</div>
                  <div className="text-xs text-green-400 font-semibold">{t('account.realMoney')} • USDT</div>
                </div>
                <Button variant="outline" size="sm" onClick={handleSignOut} className="border-red-500/30 text-red-400 hover:bg-red-500/20">
                  <LogOut className="h-4 w-4 mr-2" />
                  {t('account.signOut')}
                </Button>
              </div>
            </div>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-slate-800 border-slate-700 p-4">
              <div className="flex items-center justify-between mb-2">
                <ArrowDownLeft className="h-5 w-5 text-green-400" />
                <span className="text-xs text-gray-500">Total</span>
              </div>
              <div className="text-2xl font-bold text-white">${stats.totalDeposits.toFixed(2)}</div>
              <div className="text-xs text-gray-400 mt-1">Deposits</div>
            </Card>
            <Card className="bg-slate-800 border-slate-700 p-4">
              <div className="flex items-center justify-between mb-2">
                <ArrowUpRight className="h-5 w-5 text-cyan-400" />
                <span className="text-xs text-gray-500">Total</span>
              </div>
              <div className="text-2xl font-bold text-white">${stats.totalWithdrawals.toFixed(2)}</div>
              <div className="text-xs text-gray-400 mt-1">Withdrawals</div>
            </Card>
            <Card className="bg-slate-800 border-slate-700 p-4">
              <div className="flex items-center justify-between mb-2">
                <Activity className="h-5 w-5 text-purple-400" />
                <span className="text-xs text-gray-500">{stats.betCount}</span>
              </div>
              <div className="text-2xl font-bold text-white">{winRate}%</div>
              <div className="text-xs text-gray-400 mt-1">Win Rate</div>
            </Card>
            <Card className="bg-slate-800 border-slate-700 p-4">
              <div className="flex items-center justify-between mb-2">
                {netProfit >= 0 ? <TrendingUp className="h-5 w-5 text-green-400" /> : <TrendingDown className="h-5 w-5 text-red-400" />}
                <span className="text-xs text-gray-500">P/L</span>
              </div>
              <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {netProfit >= 0 ? '+' : ''}${netProfit.toFixed(2)}
              </div>
              <div className="text-xs text-gray-400 mt-1">Net Profit</div>
            </Card>
          </div>

          {/* Deposit / Withdraw */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-slate-800 border-cyan-500/20 p-6">
              <div className="flex items-center mb-5">
                <ArrowDownLeft className="h-6 w-6 text-green-400 mr-3" />
                <h3 className="text-xl font-bold text-white">{t('account.depositFunds')}</h3>
              </div>
              <div className="space-y-3">
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

            <Card className="bg-slate-800 border-cyan-500/20 p-6">
              <div className="flex items-center mb-5">
                <ArrowUpRight className="h-6 w-6 text-cyan-400 mr-3" />
                <h3 className="text-xl font-bold text-white">{t('account.withdrawFunds')}</h3>
              </div>
              <div className="space-y-3">
                <Button onClick={handleWithdraw} className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-3" disabled={balance <= 0}>
                  <Wallet className="h-5 w-5 mr-2" />
                  {t('account.withdrawCrypto')}
                </Button>
                <Button variant="outline" className="w-full border-slate-600 text-gray-500 py-3 cursor-not-allowed" disabled>
                  <Banknote className="h-5 w-5 mr-2" />
                  {t('account.bankTransfer')} — N/A
                </Button>
                <p className="text-sm text-gray-400 text-center pt-2">{t('account.minWithdraw')}</p>
              </div>
            </Card>
          </div>

          {/* Referral */}
          <Card className="bg-slate-800 border-purple-500/30 p-6">
            <div className="flex items-center mb-4">
              <Gift className="h-6 w-6 text-purple-400 mr-3" />
              <h3 className="text-xl font-bold text-white">{t('referral.title')}</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-400 mb-3">{t('referral.yourCode')}</p>
                <div className="flex items-center space-x-2 mb-4">
                  <div className="bg-slate-900 border border-purple-500/30 rounded-lg px-4 py-3 font-mono text-lg text-purple-300 tracking-widest flex-1 text-center">
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
                <Progress value={(qualifiedReferrals % 10) * 10} className="h-3 mb-2" />
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

          {/* Transactions */}
          <Card className="bg-slate-800 border-cyan-500/20 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">{t('account.recentTransactions')}</h3>
              <Trophy className="h-5 w-5 text-cyan-400" />
            </div>
            <div className="space-y-2">
              {transactions.length === 0 ? (
                <p className="text-gray-400 text-center py-8">{t('account.noTransactions')}</p>
              ) : (
                transactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-700/50">
                    <div className="flex items-center space-x-3">
                      <div className="h-9 w-9 rounded-full bg-slate-800 flex items-center justify-center">
                        {getTransactionIcon(transaction.type)}
                      </div>
                      <div>
                        <div className="text-white font-medium capitalize">{transaction.type}</div>
                        <div className="text-gray-500 text-xs flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {new Date(transaction.created_at).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-bold ${getTransactionColor(transaction.type)}`}>
                        {transaction.type === 'deposit' || transaction.type === 'win' ? '+' : '-'}${Number(transaction.amount).toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500">{transaction.description || transaction.status || 'Completed'}</div>
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
        onClose={() => { setShowPaymentModal(false); fetchTransactions(); fetchStats(); }}
        type={paymentType}
        amount={amount}
        onAmountChange={setAmount}
      />
    </div>
  );
};
