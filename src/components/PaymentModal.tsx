
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Bitcoin, Copy, CheckCircle, Clock } from "lucide-react";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'deposit' | 'withdraw';
  amount: string;
  onAmountChange: (amount: string) => void;
}

export const PaymentModal = ({ isOpen, onClose, type, amount, onAmountChange }: PaymentModalProps) => {
  const [selectedMethod, setSelectedMethod] = useState<'usdt' | 'card' | 'bank'>('usdt');
  const [countdown, setCountdown] = useState(300); // 5 minutes
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);

  const bitcoinAddress = "bc1qyudx6ujpxgz8llcp9mynt3az7f0yeud4hjlapn92usled7nce79sq8le39";

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
      setCountdown(300);
      setIsProcessing(false);
      setCopied(false);
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

          {/* Bitcoin Address for USDT */}
          {selectedMethod === 'usdt' && (
            <Card className="bg-slate-700/50 border-cyan-500/20 p-4">
              <div className="space-y-3">
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
                <p className="text-xs text-gray-400">
                  Send USDT to this address. Transaction will be confirmed automatically.
                </p>
              </div>
            </Card>
          )}

          {/* Card Payment Info */}
          {selectedMethod === 'card' && type === 'deposit' && (
            <Card className="bg-slate-700/50 border-cyan-500/20 p-4">
              <p className="text-sm text-gray-300">
                You will be redirected to our secure payment processor to complete your card transaction.
              </p>
            </Card>
          )}

          {/* Bank Transfer Info */}
          {selectedMethod === 'bank' && (
            <Card className="bg-slate-700/50 border-cyan-500/20 p-4">
              <p className="text-sm text-gray-300">
                Bank transfer details will be provided after confirmation. Processing time: 1-3 business days.
              </p>
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
