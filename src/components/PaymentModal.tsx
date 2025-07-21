
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bitcoin, Copy, CheckCircle, Clock, CreditCard, Building2 } from "lucide-react";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'deposit' | 'withdraw';
  amount: string;
  onAmountChange: (amount: string) => void;
}

export const PaymentModal = ({ isOpen, onClose, type, amount, onAmountChange }: PaymentModalProps) => {
  const [selectedMethod, setSelectedMethod] = useState<'usdt' | 'card' | 'bank'>('usdt');
  const [countdown, setCountdown] = useState(600); // 10 minutes
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Form states for different payment methods
  const [cryptoType, setCryptoType] = useState<'btc' | 'usdt'>('usdt');
  const [network, setNetwork] = useState<'tron' | 'ethereum' | 'bitcoin'>('tron');
  const [walletAddress, setWalletAddress] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [routingNumber, setRoutingNumber] = useState('');
  const [accountHolder, setAccountHolder] = useState('');

  // Crypto addresses
  const usdtTronAddress = "TEWRV79s2P7ZzeAicmfVSGMAwhYHwETBsJ";
  const bitcoinAddress = "bc1p7y049rfylpk3mr7z8dmtdjpfetr9nlv5p5xx3ldurwzde9gvavnsx457sl";

  // Countdown timer
  useEffect(() => {
    if (isOpen && countdown > 0) {
      const timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isOpen, countdown]);

  // Reset countdown when modal opens
  useEffect(() => {
    if (isOpen) {
      setCountdown(600); // 10 minutes
      setIsProcessing(false);
      setCopied(false);
      // Reset form states
      setCryptoType('usdt');
      setNetwork('tron');
      setWalletAddress('');
      setCardNumber('');
      setExpiryDate('');
      setCvv('');
      setCardholderName('');
      setBankAccount('');
      setRoutingNumber('');
      setAccountHolder('');
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

  const handleConfirm = () => {
    setIsProcessing(true);
    // Simulate processing
    setTimeout(() => {
      setIsProcessing(false);
      onClose();
    }, 3000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-800 border-cyan-500/20 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            {type === 'deposit' ? 'Deposit Funds' : 'Withdraw Funds'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Countdown Timer */}
          <Card className="bg-slate-700/50 border-cyan-500/20 p-4">
            <div className="flex items-center justify-center space-x-2">
              <Clock className="h-5 w-5 text-cyan-400" />
              <span className="text-lg font-bold text-cyan-400">
                Transaction expires in: {formatTime(countdown)}
              </span>
            </div>
          </Card>

          {/* Amount Input */}
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

          {/* Method Selection */}
          <div className="space-y-3">
            <Label>Payment Method</Label>
            <div className="grid gap-2">
              <Button
                variant={selectedMethod === 'usdt' ? 'default' : 'outline'}
                onClick={() => setSelectedMethod('usdt')}
                className="justify-start"
              >
                <Bitcoin className="h-4 w-4 mr-2" />
                USDT (Crypto)
              </Button>
              <Button
                variant={selectedMethod === 'card' ? 'default' : 'outline'}
                onClick={() => setSelectedMethod('card')}
                className="justify-start"
                disabled={type === 'withdraw'}
              >
                Credit/Debit Card
              </Button>
              <Button
                variant={selectedMethod === 'bank' ? 'default' : 'outline'}
                onClick={() => setSelectedMethod('bank')}
                className="justify-start"
              >
                Bank Transfer
              </Button>
            </div>
          </div>

          {/* Cryptocurrency Details */}
          {selectedMethod === 'usdt' && (
            <div className="space-y-4">
              {type === 'deposit' ? (
                <Card className="bg-slate-700/50 border-cyan-500/20 p-4">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Bitcoin className="h-5 w-5 text-orange-400" />
                      <span className="font-semibold">USDT on Tron Network</span>
                    </div>
                    <div className="relative">
                      <Input
                        value={usdtTronAddress}
                        readOnly
                        className="bg-slate-600 border-slate-500 text-sm pr-12"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(usdtTronAddress)}
                        className="absolute right-1 top-1 h-8 w-8 p-0"
                      >
                        {copied ? (
                          <CheckCircle className="h-4 w-4 text-green-400" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-red-400 font-semibold">
                      IMPORTANT: Send USDT only on Tron Network to this address.
                    </p>
                    
                    <div className="space-y-2 border-t border-slate-600 pt-4">
                      <div className="flex items-center space-x-2">
                        <Bitcoin className="h-5 w-5 text-orange-400" />
                        <span className="font-semibold">Bitcoin Address</span>
                      </div>
                      <div className="relative">
                        <Input
                          value={bitcoinAddress}
                          readOnly
                          className="bg-slate-600 border-slate-500 text-sm pr-12"
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(bitcoinAddress)}
                          className="absolute right-1 top-1 h-8 w-8 p-0"
                        >
                          {copied ? (
                            <CheckCircle className="h-4 w-4 text-green-400" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ) : (
                <Card className="bg-slate-700/50 border-cyan-500/20 p-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Cryptocurrency Type</Label>
                      <Select value={cryptoType} onValueChange={(value: 'btc' | 'usdt') => setCryptoType(value)}>
                        <SelectTrigger className="bg-slate-600 border-slate-500">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="usdt">USDT</SelectItem>
                          <SelectItem value="btc">Bitcoin (BTC)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Network</Label>
                      <Select value={network} onValueChange={(value: 'tron' | 'ethereum' | 'bitcoin') => setNetwork(value)}>
                        <SelectTrigger className="bg-slate-600 border-slate-500">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tron">Tron Network</SelectItem>
                          <SelectItem value="ethereum">Ethereum Network</SelectItem>
                          <SelectItem value="bitcoin">Bitcoin Network</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Your Wallet Address</Label>
                      <Input
                        value={walletAddress}
                        onChange={(e) => setWalletAddress(e.target.value)}
                        className="bg-slate-600 border-slate-500"
                        placeholder="Enter your wallet address"
                      />
                    </div>
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* Card Payment Details */}
          {selectedMethod === 'card' && (
            <Card className="bg-slate-700/50 border-cyan-500/20 p-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5 text-blue-400" />
                  <span className="font-semibold">{type === 'deposit' ? 'Card Payment' : 'Card Withdrawal'}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-2">
                    <Label>Cardholder Name</Label>
                    <Input
                      value={cardholderName}
                      onChange={(e) => setCardholderName(e.target.value)}
                      className="bg-slate-600 border-slate-500"
                      placeholder="Full name on card"
                    />
                  </div>
                  
                  <div className="col-span-2 space-y-2">
                    <Label>Card Number</Label>
                    <Input
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="bg-slate-600 border-slate-500"
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Expiry Date</Label>
                    <Input
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      className="bg-slate-600 border-slate-500"
                      placeholder="MM/YY"
                      maxLength={5}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>CVV</Label>
                    <Input
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                      className="bg-slate-600 border-slate-500"
                      placeholder="123"
                      maxLength={4}
                    />
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Bank Transfer Details */}
          {selectedMethod === 'bank' && (
            <Card className="bg-slate-700/50 border-cyan-500/20 p-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Building2 className="h-5 w-5 text-green-400" />
                  <span className="font-semibold">Bank Transfer</span>
                </div>
                
                {type === 'deposit' ? (
                  <div className="text-center py-4">
                    <p className="text-red-400 font-semibold">Service Not Available</p>
                    <p className="text-sm text-gray-400 mt-2">
                      Bank transfers are not available in your region at the moment.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Account Holder Name</Label>
                      <Input
                        value={accountHolder}
                        onChange={(e) => setAccountHolder(e.target.value)}
                        className="bg-slate-600 border-slate-500"
                        placeholder="Full name on account"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Bank Account Number</Label>
                      <Input
                        value={bankAccount}
                        onChange={(e) => setBankAccount(e.target.value)}
                        className="bg-slate-600 border-slate-500"
                        placeholder="Account number"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Routing Number</Label>
                      <Input
                        value={routingNumber}
                        onChange={(e) => setRoutingNumber(e.target.value)}
                        className="bg-slate-600 border-slate-500"
                        placeholder="9-digit routing number"
                      />
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 border-slate-600"
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!amount || parseFloat(amount) < (type === 'deposit' ? 100 : 200) || isProcessing || countdown <= 0}
              className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
            >
              {isProcessing ? 'Processing...' : `Confirm ${type}`}
            </Button>
          </div>

          {countdown <= 0 && (
            <p className="text-red-400 text-sm text-center">
              Transaction expired. Please close and try again.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
