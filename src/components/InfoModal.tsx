import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plane, Shield, Scale, HelpCircle, MessageSquare, FileText } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'how-to-play' | 'game-rules' | 'provably-fair' | 'help-center' | 'contact-us' | 'terms' | 'privacy' | 'responsible-gaming' | 'kyc';
}

export const InfoModal = ({ isOpen, onClose, type }: InfoModalProps) => {
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    category: '',
    description: '',
    email: ''
  });

  const handleTicketSubmit = () => {
    // Simulate ticket submission
    toast({
      title: "Ticket Submitted",
      description: "Your support ticket has been submitted successfully. We'll get back to you within 24 hours.",
    });
    setTicketForm({ subject: '', category: '', description: '', email: '' });
    onClose();
  };

  const getContent = () => {
    switch (type) {
      case 'how-to-play':
        return {
          title: 'How to Play',
          icon: <Plane className="h-6 w-6 text-cyan-400" />,
          content: (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-cyan-400">🚀 Sky Multiplier Game Guide</h3>
              <div className="space-y-3 text-gray-300">
                <p><strong>1. Place Your Bet:</strong> Choose your bet amount (minimum $10) and click "Take Off"</p>
                <p><strong>2. Watch the Flight:</strong> Your plane will fly across the sky, hitting multiplier boxes along the way</p>
                <p><strong>3. Multiplier Magic:</strong> Each box contains a multiplier that affects your winnings:
                  <br />• 🟢 Green boxes (1.3x-2.8x) = Small to decent profits
                  <br />• 🟡 Yellow boxes (3x-5x) = Big wins (rare!)
                  <br />• 🔴 Red boxes (0.5x-1.2x) = Losses or minimal gains
                </p>
                <p><strong>4. Cash Out:</strong> Click "Cash Out" while flying to secure your current winnings, or let it fly to the end for maximum multiplier</p>
                <p><strong>5. Collect:</strong> After landing or cashing out, collect your winnings and play again!</p>
                <div className="bg-slate-700/50 p-3 rounded-lg mt-4">
                  <p className="text-sm text-yellow-300"><strong>💡 Pro Tips:</strong></p>
                  <ul className="text-sm text-gray-400 mt-1 space-y-1">
                    <li>• Loss streaks improve your odds slightly</li>
                    <li>• Demo mode is perfect for learning</li>
                    <li>• Higher bets don't change multiplier odds</li>
                  </ul>
                </div>
              </div>
            </div>
          )
        };

      case 'game-rules':
        return {
          title: 'Game Rules',
          icon: <Scale className="h-6 w-6 text-cyan-400" />,
          content: (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-cyan-400">📋 Official Game Rules</h3>
              <div className="space-y-3 text-gray-300">
                <div>
                  <h4 className="font-semibold text-white">Betting Rules:</h4>
                  <ul className="text-sm space-y-1 mt-1">
                    <li>• Minimum bet: $10 USDT</li>
                    <li>• Maximum bet: $10,000 USDT</li>
                    <li>• Must have sufficient balance before placing bet</li>
                    <li>• Bets are final once the plane takes off</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-white">Gameplay Rules:</h4>
                  <ul className="text-sm space-y-1 mt-1">
                    <li>• Each flight contains 6 random multiplier boxes</li>
                    <li>• Plane hits boxes in order from left to right</li>
                    <li>• Multipliers compound (multiply together)</li>
                    <li>• Cash out anytime during flight to secure winnings</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-white">Payout Rules:</h4>
                  <ul className="text-sm space-y-1 mt-1">
                    <li>• Final winnings = Bet Amount × Final Multiplier</li>
                    <li>• Winnings credited instantly after collection</li>
                    <li>• Loss streak bonus applies automatically</li>
                    <li>• All transactions are recorded in your history</li>
                  </ul>
                </div>
              </div>
            </div>
          )
        };

      case 'provably-fair':
        return {
          title: 'Provably Fair',
          icon: <Shield className="h-6 w-6 text-cyan-400" />,
          content: (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-cyan-400">🔒 Provably Fair Gaming</h3>
              <div className="space-y-3 text-gray-300">
                <p>Sky Multiplier uses a provably fair algorithm to ensure all game outcomes are random and cannot be manipulated.</p>
                
                <div>
                  <h4 className="font-semibold text-white">How It Works:</h4>
                  <ul className="text-sm space-y-1 mt-1">
                    <li>• Server generates a random server seed (kept secret until reveal)</li>
                    <li>• Client provides a random client seed</li>
                    <li>• Game uses SHA-256 hash of combined seeds</li>
                    <li>• Multipliers are generated using this cryptographic hash</li>
                  </ul>
                </div>

                <div className="bg-slate-700/50 p-3 rounded-lg">
                  <h4 className="font-semibold text-white mb-2">Current Game Seeds:</h4>
                  <div className="text-xs font-mono space-y-1">
                    <p><span className="text-gray-400">Server Hash:</span> <span className="text-cyan-300">a7b2c3d4...</span></p>
                    <p><span className="text-gray-400">Client Seed:</span> <span className="text-cyan-300">user_12345</span></p>
                    <p><span className="text-gray-400">Nonce:</span> <span className="text-cyan-300">158473</span></p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-white">Verification:</h4>
                  <ul className="text-sm space-y-1 mt-1">
                    <li>• Change your client seed anytime in account settings</li>
                    <li>• Server seed revealed after each session</li>
                    <li>• Verify past games using our verification tool</li>
                    <li>• All game history available for audit</li>
                  </ul>
                </div>
              </div>
            </div>
          )
        };

      case 'help-center':
        return {
          title: 'Help Center',
          icon: <HelpCircle className="h-6 w-6 text-cyan-400" />,
          content: (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-cyan-400">🆘 Frequently Asked Questions</h3>
              <div className="space-y-4 text-gray-300">
                
                <div className="bg-slate-700/30 p-3 rounded-lg">
                  <h4 className="font-semibold text-white">❓ How do I deposit funds?</h4>
                  <p className="text-sm mt-1">Go to My Account → Deposit Funds. Choose from USDT crypto, Credit Card, or Bank Transfer. Minimum deposit is $100.</p>
                </div>

                <div className="bg-slate-700/30 p-3 rounded-lg">
                  <h4 className="font-semibold text-white">❓ When can I withdraw?</h4>
                  <p className="text-sm mt-1">Withdrawals are available 24/7. Minimum withdrawal is $200 USDT. Processing time: Crypto (instant), Bank (1-3 days).</p>
                </div>

                <div className="bg-slate-700/30 p-3 rounded-lg">
                  <h4 className="font-semibold text-white">❓ Is the game fair?</h4>
                  <p className="text-sm mt-1">Yes! We use provably fair technology. You can verify every game outcome using our verification system.</p>
                </div>

                <div className="bg-slate-700/30 p-3 rounded-lg">
                  <h4 className="font-semibold text-white">❓ What if I have a technical issue?</h4>
                  <p className="text-sm mt-1">Contact our support team immediately. We're available 24/7 to help resolve any problems.</p>
                </div>

                <div className="bg-slate-700/30 p-3 rounded-lg">
                  <h4 className="font-semibold text-white">❓ Can I play on mobile?</h4>
                  <p className="text-sm mt-1">Yes! Sky Multiplier works perfectly on all devices - mobile, tablet, and desktop.</p>
                </div>

                <div className="text-center mt-4">
                  <p className="text-sm text-gray-400">Still need help? Contact our support team below.</p>
                </div>
              </div>
            </div>
          )
        };

      case 'contact-us':
        return {
          title: 'Contact Support',
          icon: <MessageSquare className="h-6 w-6 text-cyan-400" />,
          content: (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-cyan-400">📞 Submit a Support Ticket</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={ticketForm.email}
                      onChange={(e) => setTicketForm(prev => ({ ...prev, email: e.target.value }))}
                      className="bg-slate-700 border-slate-600"
                      placeholder="your@email.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={ticketForm.category} onValueChange={(value) => setTicketForm(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger className="bg-slate-700 border-slate-600">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="login">Login Issues</SelectItem>
                        <SelectItem value="deposit">Deposit Problems</SelectItem>
                        <SelectItem value="withdrawal">Withdrawal Issues</SelectItem>
                        <SelectItem value="bug">Bug Report</SelectItem>
                        <SelectItem value="game">Game Issues</SelectItem>
                        <SelectItem value="feedback">Feedback</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={ticketForm.subject}
                    onChange={(e) => setTicketForm(prev => ({ ...prev, subject: e.target.value }))}
                    className="bg-slate-700 border-slate-600"
                    placeholder="Brief description of your issue"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={ticketForm.description}
                    onChange={(e) => setTicketForm(prev => ({ ...prev, description: e.target.value }))}
                    className="bg-slate-700 border-slate-600 min-h-[120px]"
                    placeholder="Please provide detailed information about your issue..."
                  />
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <Button variant="outline" onClick={onClose} className="flex-1">
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleTicketSubmit}
                    disabled={!ticketForm.email || !ticketForm.subject || !ticketForm.category}
                    className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600"
                  >
                    Submit Ticket
                  </Button>
                </div>
              </div>
            </div>
          )
        };

      case 'terms':
        return {
          title: 'Terms of Service',
          icon: <FileText className="h-6 w-6 text-cyan-400" />,
          content: (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              <h3 className="text-lg font-semibold text-cyan-400">📜 Terms of Service</h3>
              <div className="space-y-4 text-gray-300 text-sm">
                <section>
                  <h4 className="font-semibold text-white">1. Acceptance of Terms</h4>
                  <p>By accessing Sky Multiplier, you agree to be bound by these Terms of Service and all applicable laws and regulations.</p>
                </section>
                
                <section>
                  <h4 className="font-semibold text-white">2. Eligibility</h4>
                  <p>You must be 18+ years old and legally allowed to participate in online gaming in your jurisdiction. Sky Multiplier is not available in restricted territories.</p>
                </section>
                
                <section>
                  <h4 className="font-semibold text-white">3. Account Rules</h4>
                  <p>One account per person. Sharing accounts, creating multiple accounts, or using automated systems is strictly prohibited and will result in account termination.</p>
                </section>
                
                <section>
                  <h4 className="font-semibold text-white">4. Betting Rules</h4>
                  <p>All bets are final once placed. Minimum bet $10, maximum bet $10,000. You're responsible for ensuring sufficient funds before placing bets.</p>
                </section>
                
                <section>
                  <h4 className="font-semibold text-white">5. Fair Play</h4>
                  <p>Our games use provably fair algorithms. Any attempt to exploit, hack, or manipulate the system will result in immediate account suspension and forfeiture of funds.</p>
                </section>
                
                <section>
                  <h4 className="font-semibold text-white">6. Deposits and Withdrawals</h4>
                  <p>Deposits are instant. Withdrawals processed within 24 hours for crypto, 1-3 business days for bank transfers. KYC verification may be required for large transactions.</p>
                </section>
                
                <section>
                  <h4 className="font-semibold text-white">7. Limitation of Liability</h4>
                  <p>Sky Multiplier is not liable for any losses, damages, or technical issues. Gaming involves risk, and you should only bet what you can afford to lose.</p>
                </section>
              </div>
            </div>
          )
        };

      case 'privacy':
        return {
          title: 'Privacy Policy',
          icon: <Shield className="h-6 w-6 text-cyan-400" />,
          content: (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              <h3 className="text-lg font-semibold text-cyan-400">🔒 Privacy Policy</h3>
              <div className="space-y-4 text-gray-300 text-sm">
                <section>
                  <h4 className="font-semibold text-white">Information We Collect</h4>
                  <p>We collect email addresses, usernames, transaction history, and gameplay data. We use cookies for authentication and user preferences.</p>
                </section>
                
                <section>
                  <h4 className="font-semibold text-white">How We Use Your Data</h4>
                  <ul className="space-y-1 mt-1">
                    <li>• Account management and authentication</li>
                    <li>• Processing deposits and withdrawals</li>
                    <li>• Game history and statistics</li>
                    <li>• Customer support</li>
                    <li>• Security and fraud prevention</li>
                  </ul>
                </section>
                
                <section>
                  <h4 className="font-semibold text-white">Data Security</h4>
                  <p>All data is encrypted using industry-standard SSL/TLS. Passwords are hashed and salted. We never store credit card information - all payments are processed by secure third-party providers.</p>
                </section>
                
                <section>
                  <h4 className="font-semibold text-white">Data Sharing</h4>
                  <p>We don't sell your personal data. Information may be shared with payment processors, regulatory authorities (when required by law), and our security partners for fraud prevention.</p>
                </section>
                
                <section>
                  <h4 className="font-semibold text-white">Your Rights</h4>
                  <ul className="space-y-1 mt-1">
                    <li>• Request a copy of your data</li>
                    <li>• Request data deletion (account closure)</li>
                    <li>• Opt out of marketing communications</li>
                    <li>• Update your information anytime</li>
                  </ul>
                </section>
                
                <section>
                  <h4 className="font-semibold text-white">Contact Us</h4>
                  <p>Questions about privacy? Email privacy@skymultiplier.com or submit a support ticket.</p>
                </section>
              </div>
            </div>
          )
        };

      case 'responsible-gaming':
        return {
          title: 'Responsible Gaming',
          icon: <Shield className="h-6 w-6 text-cyan-400" />,
          content: (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              <h3 className="text-lg font-semibold text-cyan-400">🛡️ Responsible Gaming</h3>
              <div className="space-y-4 text-gray-300 text-sm">
                <div className="bg-red-900/20 border border-red-500/30 p-3 rounded-lg">
                  <p className="font-semibold text-red-400">⚠️ Gaming involves risk. Only bet what you can afford to lose.</p>
                </div>
                
                <section>
                  <h4 className="font-semibold text-white">Set Your Limits</h4>
                  <p>Always set daily, weekly, and monthly limits for:</p>
                  <ul className="space-y-1 mt-1">
                    <li>• Deposits</li>
                    <li>• Bet amounts</li>
                    <li>• Time spent playing</li>
                    <li>• Losses</li>
                  </ul>
                </section>
                
                <section>
                  <h4 className="font-semibold text-white">Warning Signs</h4>
                  <p>Stop playing if you experience:</p>
                  <ul className="space-y-1 mt-1">
                    <li>• Betting more than you planned</li>
                    <li>• Chasing losses with bigger bets</li>
                    <li>• Lying about your gambling</li>
                    <li>• Neglecting responsibilities</li>
                    <li>• Borrowing money to gamble</li>
                  </ul>
                </section>
                
                <section>
                  <h4 className="font-semibold text-white">Self-Exclusion Tools</h4>
                  <p>We offer various tools to help you stay in control:</p>
                  <ul className="space-y-1 mt-1">
                    <li>• Deposit limits</li>
                    <li>• Session time limits</li>
                    <li>• Cool-off periods (24h-30 days)</li>
                    <li>• Self-exclusion (6 months - permanent)</li>
                  </ul>
                </section>
                
                <section>
                  <h4 className="font-semibold text-white">Get Help</h4>
                  <p>If you need support:</p>
                  <ul className="space-y-1 mt-1">
                    <li>• Gamblers Anonymous: gamblers-anonymous.org</li>
                    <li>• National Problem Gambling Helpline: 1-800-522-4700</li>
                    <li>• GamCare: gamcare.org.uk</li>
                    <li>• BeGambleAware: begambleaware.org</li>
                  </ul>
                </section>
              </div>
            </div>
          )
        };

      case 'kyc':
        return {
          title: 'KYC Policy',
          icon: <FileText className="h-6 w-6 text-cyan-400" />,
          content: (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              <h3 className="text-lg font-semibold text-cyan-400">🆔 Know Your Customer (KYC)</h3>
              <div className="space-y-4 text-gray-300 text-sm">
                <section>
                  <h4 className="font-semibold text-white">When KYC is Required</h4>
                  <ul className="space-y-1 mt-1">
                    <li>• Withdrawals over $2,000 in 30 days</li>
                    <li>• Suspicious account activity</li>
                    <li>• Random compliance checks</li>
                    <li>• Regulatory requests</li>
                  </ul>
                </section>
                
                <section>
                  <h4 className="font-semibold text-white">Required Documents</h4>
                  <p><strong>Identity Verification:</strong></p>
                  <ul className="space-y-1 mt-1">
                    <li>• Government-issued photo ID (passport, driver's license)</li>
                    <li>• Must be valid and clearly visible</li>
                    <li>• All corners must be visible</li>
                  </ul>
                  
                  <p className="mt-3"><strong>Address Verification:</strong></p>
                  <ul className="space-y-1 mt-1">
                    <li>• Utility bill (electricity, gas, water)</li>
                    <li>• Bank statement</li>
                    <li>• Government correspondence</li>
                    <li>• Must be dated within 3 months</li>
                  </ul>
                </section>
                
                <section>
                  <h4 className="font-semibold text-white">Verification Process</h4>
                  <ol className="space-y-1 mt-1">
                    <li>1. Submit documents through your account</li>
                    <li>2. Our team reviews within 24-48 hours</li>
                    <li>3. You'll receive email confirmation</li>
                    <li>4. If approved, full account access restored</li>
                    <li>5. If rejected, we'll explain what needs fixing</li>
                  </ol>
                </section>
                
                <section>
                  <h4 className="font-semibold text-white">Data Security</h4>
                  <p>All KYC documents are:</p>
                  <ul className="space-y-1 mt-1">
                    <li>• Encrypted during transmission and storage</li>
                    <li>• Accessed only by authorized compliance staff</li>
                    <li>• Retained as required by law, then securely deleted</li>
                    <li>• Never shared except when legally required</li>
                  </ul>
                </section>
              </div>
            </div>
          )
        };

      default:
        return { title: '', icon: null, content: null };
    }
  };

  const { title, icon, content } = getContent();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-800 border-cyan-500/20 text-white max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center space-x-2">
            {icon}
            <span>{title}</span>
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto">
          {content}
        </div>
      </DialogContent>
    </Dialog>
  );
};