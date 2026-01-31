import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bitcoin, Copy, CheckCircle, Clock, CreditCard, Building2, ChevronDown, Loader2, Shield } from "lucide-react";

interface EnhancedPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'deposit' | 'withdraw';
  amount: string;
  onAmountChange: (amount: string) => void;
}

export const EnhancedPaymentModal = ({ isOpen, onClose, type, amount, onAmountChange }: EnhancedPaymentModalProps) => {
  const [step, setStep] = useState<'method-select' | 'payment-form' | '2fa-loading' | '2fa-auth'>('method-select');
  const [selectedMethod, setSelectedMethod] = useState<'crypto' | 'card' | 'bank' | null>(null);
  const [selectedCrypto, setSelectedCrypto] = useState<'usdt' | 'btc' | null>(null);
  const [countdown, setCountdown] = useState(600); // 10 minutes
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [twoFACode, setTwoFACode] = useState('');
  const [twoFACountdown, setTwoFACountdown] = useState(1800); // 30 minutes
  
  // Form states
  const [cryptoForm, setCryptoForm] = useState({
    network: 'tron',
    walletAddress: ''
  });
  const [cardForm, setCardForm] = useState({
    cardholderName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  });
  const [bankForm, setBankForm] = useState({
    accountHolder: '',
    bankAccount: '',
    routingNumber: ''
  });

  // Crypto addresses
  const addresses = {
    usdt: {
      tron: "TEWRV79s2P7ZzeAicmfVSGMAwhYHwETBsJ",
      ethereum: "0x742d35Cc6584C0532A3c0E9676F91B0f8A226c8c"
    },
    btc: {
      bitcoin: "bc1p7y049rfylpk3mr7z8dmtdjpfetr9nlv5p5xx3ldurwzde9gvavnsx457sl"
    }
  };

  // Countdown timers
  useEffect(() => {
    if (isOpen && countdown > 0 && step !== 'method-select') {
      const timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [isOpen, countdown, step]);

  useEffect(() => {
    if (step === '2fa-auth' && twoFACountdown > 0) {
      const timer = setInterval(() => setTwoFACountdown(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [step, twoFACountdown]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep('method-select');
      setSelectedMethod(null);
      setSelectedCrypto(null);
      setCountdown(600);
      setTwoFACountdown(1800);
      setIsProcessing(false);
      setCopied(false);
      setTwoFACode('');
      setCryptoForm({ network: 'tron', walletAddress: '' });
      setCardForm({ cardholderName: '', cardNumber: '', expiryDate: '', cvv: '' });
      setBankForm({ accountHolder: '', bankAccount: '', routingNumber: '' });
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

  const handleMethodSelect = (method: 'crypto' | 'card' | 'bank') => {
    setSelectedMethod(method);
    if (method === 'crypto') {
      // For crypto, we need to show crypto type selection first
      setStep('payment-form');
    } else {
      setStep('payment-form');
    }
  };

  const handleCryptoSelect = (cryptoType: 'usdt' | 'btc') => {
    setSelectedCrypto(cryptoType);
    if (cryptoType === 'btc') {
      setCryptoForm(prev => ({ ...prev, network: 'bitcoin' }));
    }
  };

  const handleFormSubmit = () => {
    if (selectedMethod === 'card') {
      // Card payment goes through loading then 2FA
      setStep('2fa-loading');
      setIsProcessing(true);
      
      setTimeout(() => {
        setIsProcessing(false);
        setStep('2fa-auth');
      }, 3000);
    } else {
      // Other methods process normally
      setIsProcessing(true);
      setTimeout(() => {
        setIsProcessing(false);
        onClose();
      }, 2000);
    }
  };

  const handleTwoFASubmit = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onClose();
    }, 2000);
  };

  const renderMethodSelection = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="amount">Amount (USDT)</Label>
        <Input
          id="amount"
          type="number"
          value={amount}
          onChange={(e) => onAmountChange(e.target.value)}
          className="bg-slate-700 border-slate-600 text-white"
          placeholder={type === 'deposit' ? 'Min: $100 USDT' : 'Min: $200 USDT'}
          min={type === 'deposit' ? '100' : '200'}
        />
      </div>

      <div className="space-y-3">
        <Label>Select Payment Method</Label>
        <div className="grid gap-3">
          <Button
            onClick={() => handleMethodSelect('crypto')}
            variant="outline"
            className="h-16 justify-between border-slate-600 hover:border-cyan-500/50"
          >
            <div className="flex items-center space-x-3">
              <Bitcoin className="h-6 w-6 text-orange-400" />
              <div className="text-left">
                <div className="font-semibold">Crypto</div>
                <div className="text-xs text-gray-400">USDT, Bitcoin - Instant & Secure</div>
              </div>
            </div>
            <ChevronDown className="h-4 w-4" />
          </Button>
          
          {!selectedMethod && (
            <Button
              variant="outline"
              className="h-16 justify-between border-slate-600 opacity-60 cursor-not-allowed"
              disabled
            >
              <div className="flex items-center space-x-3">
                <CreditCard className="h-6 w-6 text-blue-400" />
                <div className="text-left">
                  <div className="font-semibold">Credit/Debit Card</div>
                  <div className="text-xs text-red-400">Not available in your region</div>
                </div>
              </div>
              <ChevronDown className="h-4 w-4" />
            </Button>
          )}
          
          {!selectedMethod && (
            <Button
              onClick={type === 'withdraw' ? () => handleMethodSelect('bank') : undefined}
              variant="outline"
              className={`h-16 justify-between border-slate-600 ${type === 'deposit' ? 'opacity-60 cursor-not-allowed' : 'hover:border-cyan-500/50'}`}
              disabled={type === 'deposit'}
            >
              <div className="flex items-center space-x-3">
                <Building2 className="h-6 w-6 text-green-400" />
                <div className="text-left">
                  <div className="font-semibold">Bank Transfer</div>
                  <div className={`text-xs ${type === 'deposit' ? 'text-red-400' : 'text-gray-400'}`}>
                    {type === 'deposit' ? 'Not available in your region' : '1-3 business days'}
                  </div>
                </div>
              </div>
              <ChevronDown className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  const renderCryptoForm = () => (
    <div className="space-y-4">
      {/* Countdown Timer */}
      <Card className="bg-slate-700/50 border-cyan-500/20 p-4">
        <div className="flex items-center justify-center space-x-2">
          <Clock className="h-5 w-5 text-cyan-400" />
          <span className="text-lg font-bold text-cyan-400">
            Transaction expires in: {formatTime(countdown)}
          </span>
        </div>
      </Card>

      {type === 'deposit' ? (
        <>
          {/* Crypto type selection */}
          <div className="space-y-3">
            <Label>Select Cryptocurrency</Label>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant={selectedCrypto === 'usdt' ? 'default' : 'outline'}
                onClick={() => handleCryptoSelect('usdt')}
                className="h-12"
              >
                <Bitcoin className="h-4 w-4 mr-2 text-green-400" />
                USDT
              </Button>
              <Button
                variant={selectedCrypto === 'btc' ? 'default' : 'outline'}
                onClick={() => handleCryptoSelect('btc')}
                className="h-12"
              >
                <Bitcoin className="h-4 w-4 mr-2 text-orange-400" />
                Bitcoin
              </Button>
            </div>
          </div>

          {selectedCrypto && (
            <Card className="bg-slate-700/50 border-cyan-500/20 p-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Bitcoin className="h-5 w-5 text-orange-400" />
                  <span className="font-semibold">
                    {selectedCrypto === 'usdt' ? 'USDT Deposit Address' : 'Bitcoin Deposit Address'}
                  </span>
                </div>
                
                {selectedCrypto === 'usdt' && (
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm">Tron Network (TRC-20)</Label>
                      <div className="relative mt-1">
                        <Input
                          value={addresses.usdt.tron}
                          readOnly
                          className="bg-slate-600 border-slate-500 text-sm pr-12"
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(addresses.usdt.tron)}
                          className="absolute right-1 top-1 h-8 w-8 p-0"
                        >
                          {copied ? <CheckCircle className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm">Ethereum Network (ERC-20)</Label>
                      <div className="relative mt-1">
                        <Input
                          value={addresses.usdt.ethereum}
                          readOnly
                          className="bg-slate-600 border-slate-500 text-sm pr-12"
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(addresses.usdt.ethereum)}
                          className="absolute right-1 top-1 h-8 w-8 p-0"
                        >
                          {copied ? <CheckCircle className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {selectedCrypto === 'btc' && (
                  <div className="relative">
                    <Input
                      value={addresses.btc.bitcoin}
                      readOnly
                      className="bg-slate-600 border-slate-500 text-sm pr-12"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(addresses.btc.bitcoin)}
                      className="absolute right-1 top-1 h-8 w-8 p-0"
                    >
                      {copied ? <CheckCircle className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                )}

                <p className="text-xs text-red-400 font-semibold">
                  IMPORTANT: Send only {selectedCrypto.toUpperCase()} to this address. 
                  {selectedCrypto === 'usdt' ? ' Wrong network will result in loss of funds.' : ''}
                </p>
              </div>
            </Card>
          )}
        </>
      ) : (
        // Withdrawal form
        <Card className="bg-slate-700/50 border-cyan-500/20 p-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Cryptocurrency Type</Label>
              <Select value={selectedCrypto || ''} onValueChange={(value: 'usdt' | 'btc') => setSelectedCrypto(value)}>
                <SelectTrigger className="bg-slate-600 border-slate-500">
                  <SelectValue placeholder="Select crypto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="usdt">USDT</SelectItem>
                  <SelectItem value="btc">Bitcoin (BTC)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Network</Label>
              <Select value={cryptoForm.network} onValueChange={(value) => setCryptoForm(prev => ({ ...prev, network: value }))}>
                <SelectTrigger className="bg-slate-600 border-slate-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {selectedCrypto === 'usdt' ? (
                    <>
                      <SelectItem value="tron">Tron Network (TRC-20)</SelectItem>
                      <SelectItem value="ethereum">Ethereum Network (ERC-20)</SelectItem>
                    </>
                  ) : (
                    <SelectItem value="bitcoin">Bitcoin Network</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Your Wallet Address</Label>
              <Input
                value={cryptoForm.walletAddress}
                onChange={(e) => setCryptoForm(prev => ({ ...prev, walletAddress: e.target.value }))}
                className="bg-slate-600 border-slate-500"
                placeholder="Enter your wallet address"
              />
            </div>
          </div>
        </Card>
      )}
    </div>
  );

  const renderCardForm = () => (
    <div className="space-y-4">
      {/* Countdown Timer */}
      <Card className="bg-slate-700/50 border-cyan-500/20 p-4">
        <div className="flex items-center justify-center space-x-2">
          <Clock className="h-5 w-5 text-cyan-400" />
          <span className="text-lg font-bold text-cyan-400">
            Transaction expires in: {formatTime(countdown)}
          </span>
        </div>
      </Card>

      <Card className="bg-slate-700/50 border-cyan-500/20 p-4">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5 text-blue-400" />
            <span className="font-semibold">Card Payment Details</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <Label>Cardholder Name</Label>
              <Input
                value={cardForm.cardholderName}
                onChange={(e) => setCardForm(prev => ({ ...prev, cardholderName: e.target.value }))}
                className="bg-slate-600 border-slate-500"
                placeholder="Full name on card"
              />
            </div>
            
            <div className="col-span-2 space-y-2">
              <Label>Card Number</Label>
              <Input
                value={cardForm.cardNumber}
                onChange={(e) => setCardForm(prev => ({ ...prev, cardNumber: e.target.value }))}
                className="bg-slate-600 border-slate-500"
                placeholder="1234 5678 9012 3456"
                maxLength={19}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Expiry Date</Label>
              <Input
                value={cardForm.expiryDate}
                onChange={(e) => setCardForm(prev => ({ ...prev, expiryDate: e.target.value }))}
                className="bg-slate-600 border-slate-500"
                placeholder="MM/YY"
                maxLength={5}
              />
            </div>
            
            <div className="space-y-2">
              <Label>CVV</Label>
              <Input
                value={cardForm.cvv}
                onChange={(e) => setCardForm(prev => ({ ...prev, cvv: e.target.value }))}
                className="bg-slate-600 border-slate-500"
                placeholder="123"
                maxLength={4}
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  const render2FALoading = () => (
    <div className="space-y-6 text-center py-8">
      <Loader2 className="h-16 w-16 animate-spin text-cyan-400 mx-auto" />
      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-white">Processing Payment...</h3>
        <p className="text-gray-400">Please wait while we process your card payment</p>
      </div>
    </div>
  );

  const render2FAAuth = () => (
    <div className="space-y-6">
      <Card className="bg-slate-700/50 border-cyan-500/20 p-4">
        <div className="flex items-center justify-center space-x-2">
          <Clock className="h-5 w-5 text-cyan-400" />
          <span className="text-lg font-bold text-cyan-400">
            Session expires in: {formatTime(twoFACountdown)}
          </span>
        </div>
      </Card>

      <Card className="bg-slate-700/50 border-cyan-500/20 p-6">
        <div className="text-center space-y-4">
          <Shield className="h-16 w-16 text-cyan-400 mx-auto" />
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-white">Two-Factor Authentication</h3>
            <p className="text-gray-400">
              We've sent a 6-digit verification code to your registered phone number ending in ****7832
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Enter 6-digit code</Label>
              <Input
                value={twoFACode}
                onChange={(e) => setTwoFACode(e.target.value)}
                className="bg-slate-600 border-slate-500 text-center text-2xl tracking-widest"
                placeholder="000000"
                maxLength={6}
              />
            </div>
            
            <div className="text-sm text-gray-400">
              Didn't receive the code? 
              <button className="text-cyan-400 ml-1 hover:underline">Resend SMS</button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-800 border-cyan-500/20 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            {type === 'deposit' ? 'Deposit Funds' : 'Withdraw Funds'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {step === 'method-select' && renderMethodSelection()}
          {step === 'payment-form' && selectedMethod === 'crypto' && renderCryptoForm()}
          {step === 'payment-form' && selectedMethod === 'card' && renderCardForm()}
          {step === '2fa-loading' && render2FALoading()}
          {step === '2fa-auth' && render2FAAuth()}

          {/* Action Buttons */}
          {step !== '2fa-loading' && (
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={step === 'method-select' ? onClose : () => setStep('method-select')}
                className="flex-1 border-slate-600"
                disabled={isProcessing}
              >
                {step === 'method-select' ? 'Cancel' : 'Back'}
              </Button>
              
              {step === 'method-select' ? null : (
                <Button
                  onClick={step === '2fa-auth' ? handleTwoFASubmit : handleFormSubmit}
                  disabled={
                    isProcessing ||
                    !amount ||
                    parseFloat(amount) < (type === 'deposit' ? 100 : 200) ||
                    (step === 'payment-form' && countdown <= 0) ||
                    (step === '2fa-auth' && (twoFACode.length !== 6 || twoFACountdown <= 0))
                  }
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
                >
                  {isProcessing ? 'Processing...' : 
                   step === '2fa-auth' ? 'Verify & Complete' : 
                   `Confirm ${type}`}
                </Button>
              )}
            </div>
          )}

          {/* Expiry warnings */}
          {countdown <= 0 && step === 'payment-form' && (
            <p className="text-red-400 text-sm text-center">
              Transaction expired. Please go back and try again.
            </p>
          )}
          
          {twoFACountdown <= 0 && step === '2fa-auth' && (
            <p className="text-red-400 text-sm text-center">
              Session expired. Please start over.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
