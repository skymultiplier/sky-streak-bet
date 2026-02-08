import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Bitcoin, Copy, CheckCircle, Clock, CreditCard, Building2, ChevronDown, ChevronRight, Loader2, Shield, ArrowLeft, AlertCircle, Wallet, Coins } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface EnhancedPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'deposit' | 'withdraw';
  amount: string;
  onAmountChange: (amount: string) => void;
}

export const EnhancedPaymentModal = ({ isOpen, onClose, type, amount, onAmountChange }: EnhancedPaymentModalProps) => {
  const { t } = useLanguage();
  const [step, setStep] = useState<'amount' | 'method-select' | 'crypto-select' | 'address-display' | 'withdraw-form' | 'processing'>('amount');
  const [selectedCrypto, setSelectedCrypto] = useState<'usdt' | 'btc' | null>(null);
  const [countdown, setCountdown] = useState(600);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');

  const addresses = {
    usdt: { tron: "TEWRV79s2P7ZzeAicmfVSGMAwhYHwETBsJ" },
    btc: { bitcoin: "bc1p7y049rfylpk3mr7z8dmtdjpfetr9nlv5p5xx3ldurwzde9gvavnsx457sl" }
  };

  useEffect(() => {
    if (isOpen && countdown > 0 && step === 'address-display') {
      const timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [isOpen, countdown, step]);

  useEffect(() => {
    if (isOpen) {
      setStep('amount');
      setSelectedCrypto(null);
      setCountdown(600);
      setIsProcessing(false);
      setCopied(false);
      setWalletAddress('');
    }
  }, [isOpen]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAmountContinue = () => setStep('method-select');

  const handleCryptoMethodSelect = () => setStep('crypto-select');

  const handleCryptoSelect = (crypto: 'usdt' | 'btc') => {
    setSelectedCrypto(crypto);
    if (type === 'deposit') {
      setStep('address-display');
    } else {
      setStep('withdraw-form');
    }
  };

  const handleWithdrawSubmit = () => {
    setStep('processing');
    setIsProcessing(true);
    setTimeout(() => { setIsProcessing(false); onClose(); }, 3000);
  };

  const handleBack = () => {
    if (step === 'method-select') setStep('amount');
    else if (step === 'crypto-select') setStep('method-select');
    else if (step === 'address-display' || step === 'withdraw-form') { setStep('crypto-select'); setSelectedCrypto(null); }
  };

  const getMinAmount = () => type === 'deposit' ? 100 : 200;
  const isAmountValid = () => { const n = parseFloat(amount); return !isNaN(n) && n >= getMinAmount(); };

  const renderAmountStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Wallet className="h-12 w-12 text-cyan-400 mx-auto mb-3" />
        <p className="text-gray-400 text-sm">
          {type === 'deposit' ? t('payment.enterAmount') : t('payment.enterWithdrawAmount')}
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="amount">{t('payment.amountLabel')}</Label>
        <Input id="amount" type="number" value={amount} onChange={(e) => onAmountChange(e.target.value)}
          className="bg-slate-700 border-slate-600 text-white text-center text-2xl h-14" placeholder="0.00" min={getMinAmount().toString()} />
        <p className="text-xs text-gray-400 text-center">{t('payment.minimum')}: ${getMinAmount()} USDT</p>
      </div>
      <Button onClick={handleAmountContinue} disabled={!isAmountValid()}
        className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 h-12 font-semibold">
        {t('payment.continue')}
        <ChevronRight className="h-4 w-4 ml-2" />
      </Button>
      <Card className="bg-slate-700/30 border-slate-600/50 p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-gray-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-gray-400">
            <p className="font-medium text-gray-300 mb-1">{t('payment.otherMethods')}</p>
            <div className="flex items-center space-x-2 mb-1">
              <CreditCard className="h-4 w-4" />
              <span>{t('payment.cardNotAvailable')}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Building2 className="h-4 w-4" />
              <span>{t('payment.bankNotAvailable')}</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderMethodSelectStep = () => (
    <div className="space-y-4">
      <Button variant="ghost" onClick={handleBack} className="text-gray-400 hover:text-white p-0 h-auto">
        <ArrowLeft className="h-4 w-4 mr-2" />{t('payment.back')}
      </Button>
      <div className="text-center mb-4">
        <p className="text-lg font-semibold text-white mb-1">
          {type === 'deposit' ? `${t('payment.deposit')} $${amount} USDT` : `${t('payment.withdraw')} $${amount} USDT`}
        </p>
        <p className="text-gray-400 text-sm">Select payment method</p>
      </div>
      <div className="grid gap-4">
        <Card onClick={handleCryptoMethodSelect}
          className="bg-slate-700/50 border-slate-600 hover:border-cyan-500/50 p-5 cursor-pointer transition-all hover:bg-slate-700/70">
          <div className="flex items-center space-x-4">
            <div className="h-14 w-14 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
              <Coins className="h-7 w-7 text-cyan-400" />
            </div>
            <div className="flex-1">
              <div className="font-bold text-white text-lg">{t('payment.crypto')}</div>
              <div className="text-sm text-gray-400">{t('payment.cryptoDesc')}</div>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </div>
        </Card>
        <Card className="bg-slate-700/30 border-slate-600/30 p-5 opacity-50 cursor-not-allowed">
          <div className="flex items-center space-x-4">
            <div className="h-14 w-14 rounded-full bg-slate-600/20 flex items-center justify-center">
              <CreditCard className="h-7 w-7 text-gray-500" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-gray-500 text-lg">{t('payment.cardNotAvailable').split(' - ')[0]}</div>
              <div className="text-sm text-gray-600">Not available in your region</div>
            </div>
          </div>
        </Card>
        <Card className="bg-slate-700/30 border-slate-600/30 p-5 opacity-50 cursor-not-allowed">
          <div className="flex items-center space-x-4">
            <div className="h-14 w-14 rounded-full bg-slate-600/20 flex items-center justify-center">
              <Building2 className="h-7 w-7 text-gray-500" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-gray-500 text-lg">{t('payment.bankNotAvailable').split(' - ')[0]}</div>
              <div className="text-sm text-gray-600">Not available in your region</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );

  const renderCryptoSelectStep = () => (
    <div className="space-y-4">
      <Button variant="ghost" onClick={handleBack} className="text-gray-400 hover:text-white p-0 h-auto">
        <ArrowLeft className="h-4 w-4 mr-2" />{t('payment.back')}
      </Button>
      <div className="text-center mb-4">
        <p className="text-lg font-semibold text-white mb-1">
          {type === 'deposit' ? `${t('payment.deposit')} $${amount} USDT` : `${t('payment.withdraw')} $${amount} USDT`}
        </p>
        <p className="text-gray-400 text-sm">{t('payment.selectCurrency')}</p>
      </div>
      <div className="grid gap-4">
        <Card onClick={() => handleCryptoSelect('usdt')}
          className="bg-slate-700/50 border-slate-600 hover:border-green-500/50 p-5 cursor-pointer transition-all hover:bg-slate-700/70">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center">
              <span className="text-green-400 font-bold text-lg">₮</span>
            </div>
            <div className="flex-1">
              <div className="font-semibold text-white text-lg">{t('payment.usdtName')}</div>
              <div className="text-sm text-gray-400">{t('payment.usdtDesc')}</div>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </div>
        </Card>
        <Card onClick={() => handleCryptoSelect('btc')}
          className="bg-slate-700/50 border-slate-600 hover:border-orange-500/50 p-5 cursor-pointer transition-all hover:bg-slate-700/70">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-full bg-orange-500/20 flex items-center justify-center">
              <Bitcoin className="h-6 w-6 text-orange-400" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-white text-lg">{t('payment.btcName')}</div>
              <div className="text-sm text-gray-400">{t('payment.btcDesc')}</div>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </div>
        </Card>
      </div>
    </div>
  );

  const renderAddressDisplayStep = () => {
    const address = selectedCrypto === 'btc' ? addresses.btc.bitcoin : addresses.usdt.tron;
    const cryptoName = selectedCrypto === 'btc' ? t('payment.btcName') : t('payment.usdtName');
    const networkName = selectedCrypto === 'btc' ? 'Bitcoin Network' : 'Tron Network (TRC-20)';

    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={handleBack} className="text-gray-400 hover:text-white p-0 h-auto">
          <ArrowLeft className="h-4 w-4 mr-2" />{t('payment.back')}
        </Button>
        <Card className="bg-slate-700/50 border-cyan-500/20 p-3">
          <div className="flex items-center justify-center space-x-2">
            <Clock className="h-4 w-4 text-cyan-400" />
            <span className="font-bold text-cyan-400">{t('payment.expiresIn')}: {formatTime(countdown)}</span>
          </div>
        </Card>
        <div className="text-center py-3">
          <p className="text-gray-400 text-sm mb-1">{t('payment.amountToSend')}</p>
          <p className="text-3xl font-bold text-white">${amount} USDT</p>
          <p className="text-sm text-gray-400 mt-1">≈ {cryptoName} {t('payment.equivalent')}</p>
        </div>
        <Card className="bg-slate-700/50 border-cyan-500/30 p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {selectedCrypto === 'btc' ? <Bitcoin className="h-5 w-5 text-orange-400" /> : <span className="text-green-400 font-bold">₮</span>}
                <span className="font-medium text-white">{cryptoName}</span>
              </div>
              <span className="text-xs text-gray-400 bg-slate-600 px-2 py-1 rounded">{networkName}</span>
            </div>
            <div className="bg-slate-800 rounded-lg p-3 break-all">
              <p className="text-sm text-gray-300 font-mono">{address}</p>
            </div>
            <Button onClick={() => copyToClipboard(address)} variant="outline" className="w-full border-cyan-500/30 hover:bg-cyan-500/10">
              {copied ? (<><CheckCircle className="h-4 w-4 mr-2 text-green-400" />{t('payment.copied')}</>) : (<><Copy className="h-4 w-4 mr-2" />{t('payment.copyAddress')}</>)}
            </Button>
          </div>
        </Card>
        <Card className={`p-4 ${selectedCrypto === 'btc' ? 'bg-orange-500/10 border-orange-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
          <div className="flex items-start space-x-3">
            <AlertCircle className={`h-5 w-5 flex-shrink-0 mt-0.5 ${selectedCrypto === 'btc' ? 'text-orange-400' : 'text-red-400'}`} />
            <div className="text-sm">
              {selectedCrypto === 'btc' ? (
                <>
                  <p className="font-semibold text-orange-400 mb-1">{t('payment.btcInstructions')}</p>
                  <p className="text-gray-300">
                    Send the <strong>exact Bitcoin equivalent</strong> of ${amount} USDT to this address. 
                    The exchange rate will be calculated at the time of confirmation.
                  </p>
                </>
              ) : (
                <>
                  <p className="font-semibold text-red-400 mb-1">{t('payment.usdtNotice')}</p>
                  <p className="text-gray-300">
                    Send only <strong>USDT on the Tron Network (TRC-20)</strong> to this address. 
                    Sending other tokens or using wrong network will result in permanent loss of funds.
                  </p>
                </>
              )}
            </div>
          </div>
        </Card>
        <Button onClick={onClose} className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700">
          {t('payment.sentPayment')}
        </Button>
      </div>
    );
  };

  const renderWithdrawFormStep = () => {
    const cryptoName = selectedCrypto === 'btc' ? t('payment.btcName') : t('payment.usdtName');
    const networkName = selectedCrypto === 'btc' ? 'Bitcoin Network' : 'Tron Network (TRC-20)';

    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={handleBack} className="text-gray-400 hover:text-white p-0 h-auto">
          <ArrowLeft className="h-4 w-4 mr-2" />{t('payment.back')}
        </Button>
        <div className="text-center py-2">
          <p className="text-gray-400 text-sm mb-1">{t('payment.withdrawing')}</p>
          <p className="text-2xl font-bold text-white">${amount} USDT</p>
          <p className="text-sm text-gray-400 mt-1">{t('payment.as')} {cryptoName}</p>
        </div>
        <Card className="bg-slate-700/50 border-cyan-500/20 p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-600">
              <div className="flex items-center space-x-2">
                {selectedCrypto === 'btc' ? <Bitcoin className="h-5 w-5 text-orange-400" /> : <span className="text-green-400 font-bold text-lg">₮</span>}
                <span className="font-medium text-white">{cryptoName}</span>
              </div>
              <span className="text-xs text-gray-400 bg-slate-600 px-2 py-1 rounded">{networkName}</span>
            </div>
            <div className="space-y-2">
              <Label>{t('payment.walletAddress').replace('{crypto}', cryptoName)}</Label>
              <Input value={walletAddress} onChange={(e) => setWalletAddress(e.target.value)}
                className="bg-slate-600 border-slate-500" placeholder={t('payment.walletPlaceholder').replace('{crypto}', cryptoName)} />
            </div>
          </div>
        </Card>
        <Card className="bg-yellow-500/10 border-yellow-500/30 p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-300">
              <p className="font-semibold text-yellow-400 mb-1">{t('payment.doubleCheck')}</p>
              <p>{t('payment.doubleCheckDesc')}</p>
            </div>
          </div>
        </Card>
        <Button onClick={handleWithdrawSubmit} disabled={!walletAddress.trim()}
          className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 h-12 font-semibold">
          {t('payment.confirmWithdraw')}
        </Button>
      </div>
    );
  };

  const renderProcessingStep = () => (
    <div className="space-y-6 text-center py-8">
      <Loader2 className="h-16 w-16 animate-spin text-cyan-400 mx-auto" />
      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-white">{t('payment.processing')}...</h3>
        <p className="text-gray-400">{t('payment.processingText')}</p>
      </div>
      <div className="flex items-center justify-center space-x-2 text-xs text-gray-400">
        <Shield className="h-4 w-4" />
        <span>{t('payment.secured')}</span>
      </div>
    </div>
  );

  const getStepTitle = () => {
    switch (step) {
      case 'amount': return type === 'deposit' ? t('payment.depositFunds') : t('payment.withdrawFunds');
      case 'method-select': return type === 'deposit' ? t('payment.depositFunds') : t('payment.withdrawFunds');
      case 'crypto-select': return t('payment.selectCrypto');
      case 'address-display': return t('payment.depositAddress');
      case 'withdraw-form': return t('payment.withdrawDetails');
      case 'processing': return t('payment.processing');
      default: return type === 'deposit' ? t('payment.deposit') : t('payment.withdraw');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-800 border-cyan-500/20 text-white max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">{getStepTitle()}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {step === 'amount' && renderAmountStep()}
          {step === 'method-select' && renderMethodSelectStep()}
          {step === 'crypto-select' && renderCryptoSelectStep()}
          {step === 'address-display' && renderAddressDisplayStep()}
          {step === 'withdraw-form' && renderWithdrawFormStep()}
          {step === 'processing' && renderProcessingStep()}
        </div>
      </DialogContent>
    </Dialog>
  );
};
