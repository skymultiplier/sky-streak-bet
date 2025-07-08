
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowUpRight, ArrowDownLeft, Clock, CheckCircle } from "lucide-react";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'deposit' | 'withdraw';
  amount: string;
  onAmountChange: (amount: string) => void;
}

export const PaymentModal = ({ isOpen, onClose, type, amount, onAmountChange }: PaymentModalProps) => {
  const [step, setStep] = useState<'amount' | 'confirm' | 'processing' | 'success'>('amount');
  const [countdown, setCountdown] = useState(30);
  const [isCountdownActive, setIsCountdownActive] = useState(false);

  useEffect(() => {
    if (isCountdownActive && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setStep('processing');
      setTimeout(() => {
        setStep('success');
        setTimeout(() => {
          handleClose();
        }, 2000);
      }, 3000);
    }
  }, [countdown, isCountdownActive]);

  const handleClose = () => {
    setStep('amount');
    setCountdown(30);
    setIsCountdownActive(false);
    onAmountChange('');
    onClose();
  };

  const handleConfirm = () => {
    setStep('confirm');
    setIsCountdownActive(true);
    setCountdown(30);
  };

  const handleCancel = () => {
    setIsCountdownActive(false);
    setStep('amount');
    setCountdown(30);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-slate-800 border-cyan-500/20 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            {type === 'deposit' ? (
              <ArrowDownLeft className="h-5 w-5 text-green-400 mr-2" />
            ) : (
              <ArrowUpRight className="h-5 w-5 text-cyan-400 mr-2" />
            )}
            {type === 'deposit' ? 'Deposit Funds' : 'Withdraw Funds'}
          </DialogTitle>
        </DialogHeader>

        {step === 'amount' && (
          <div className="space-y-6">
            <div>
              <Label htmlFor="amount" className="text-gray-300">
                Amount (USDT)
              </Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => onAmountChange(e.target.value)}
                placeholder="Enter amount"
                className="bg-slate-700 border-slate-600 text-white mt-2"
                min="1"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Amount:</span>
                <span className="text-white">${amount || '0'} USDT</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Fee:</span>
                <span className="text-white">$0.00</span>
              </div>
              <div className="border-t border-slate-600 pt-2">
                <div className="flex justify-between font-semibold">
                  <span className="text-gray-300">Total:</span>
                  <span className="text-cyan-400">${amount || '0'} USDT</span>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={handleClose}
                variant="outline"
                className="flex-1 border-slate-600 text-gray-300"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={!amount || parseFloat(amount) <= 0}
                className={`flex-1 ${
                  type === 'deposit' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-cyan-600 hover:bg-cyan-700'
                } text-white`}
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {step === 'confirm' && (
          <div className="space-y-6 text-center">
            <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4">
              <Clock className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
              <h3 className="text-lg font-semibold text-yellow-400 mb-2">
                Confirm Transaction
              </h3>
              <p className="text-gray-300 mb-4">
                Please confirm your {type} of ${amount} USDT
              </p>
              <div className="text-3xl font-bold text-yellow-400 mb-2">
                {countdown}s
              </div>
              <p className="text-sm text-gray-400">
                Transaction will auto-confirm in {countdown} seconds
              </p>
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={handleCancel}
                variant="outline"
                className="flex-1 border-slate-600 text-gray-300"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setIsCountdownActive(false);
                  setStep('processing');
                  setTimeout(() => {
                    setStep('success');
                    setTimeout(() => handleClose(), 2000);
                  }, 3000);
                }}
                className={`flex-1 ${
                  type === 'deposit' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-cyan-600 hover:bg-cyan-700'
                } text-white`}
              >
                Confirm Now
              </Button>
            </div>
          </div>
        )}

        {step === 'processing' && (
          <div className="space-y-6 text-center py-8">
            <div className="animate-spin mx-auto h-12 w-12 border-4 border-cyan-400 border-t-transparent rounded-full"></div>
            <h3 className="text-lg font-semibold text-cyan-400">
              Processing Transaction...
            </h3>
            <p className="text-gray-300">
              Please wait while we process your {type}
            </p>
          </div>
        )}

        {step === 'success' && (
          <div className="space-y-6 text-center py-8">
            <CheckCircle className="h-16 w-16 text-green-400 mx-auto" />
            <h3 className="text-lg font-semibold text-green-400">
              Transaction Successful!
            </h3>
            <p className="text-gray-300">
              Your {type} of ${amount} USDT has been processed successfully
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
