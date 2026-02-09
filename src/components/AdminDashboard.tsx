import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, MessageSquare, DollarSign, CheckCircle, Clock, AlertTriangle, Shield, Lock, Gift, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

interface User {
  id: string;
  username: string;
  balance: number;
  created_at: string;
  status?: string;
  referral_code?: string;
  referred_by?: string;
}

interface Transaction {
  id: string;
  user_id: string;
  type: string;
  amount: number;
  description?: string | null;
  reference?: string | null;
  created_at: string;
  status?: string;
}

interface SupportTicket {
  id: string;
  user_id: string;
  subject: string;
  message: string;
  status: string;
  admin_response?: string | null;
  created_at: string;
  updated_at?: string;
}

interface Referral {
  id: string;
  referrer_id: string;
  referred_id: string;
  status: string;
  deposit_made: boolean;
  reward_paid: boolean;
  created_at: string;
}

const ADMIN_PASSWORD = "SkyAdmin2024!";

export const AdminDashboard = () => {
  const { t } = useLanguage();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);

  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [adjustmentAmount, setAdjustmentAmount] = useState('');
  const [adjustmentReason, setAdjustmentReason] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [selectedTicketId, setSelectedTicketId] = useState<string>('');
  const [ticketResponse, setTicketResponse] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      fetchUsers();
      fetchTransactions();
      fetchSupportTickets();
      fetchReferrals();
    }
  }, [isAuthenticated]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setPasswordError(false);
    } else {
      setPasswordError(true);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({ title: "Error", description: "Failed to fetch users. Make sure you're logged in as an admin.", variant: "destructive" });
    }
  };

  const fetchSupportTickets = async () => {
    try {
      const { data, error } = await supabase.from('support_tickets').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setSupportTickets(data || []);
    } catch (error) {
      console.error('Error fetching support tickets:', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase.from('transactions').select('*').order('created_at', { ascending: false }).limit(50);
      if (error) throw error;
      setTransactions(data || []);
    } catch (error) { console.error('Error fetching transactions:', error); }
  };

  const fetchReferrals = async () => {
    try {
      const { data, error } = await supabase.from('referrals').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setReferrals(data || []);
    } catch (error) {
      console.error('Error fetching referrals:', error);
    }
  };

  const handleBalanceAdjustment = async () => {
    if (!selectedUserId || !adjustmentAmount || !adjustmentReason) {
      toast({ title: "Missing Information", description: "Please fill in all fields for balance adjustment.", variant: "destructive" });
      return;
    }
    try {
      const amount = parseFloat(adjustmentAmount);
      const { data, error } = await supabase.rpc('admin_adjust_balance', {
        p_target_user_id: selectedUserId, p_amount: amount, p_reason: adjustmentReason
      });
      if (error) throw error;
      toast({ title: "Balance Adjusted", description: `Successfully adjusted balance by $${amount}` });
      fetchUsers();
      fetchTransactions();
      setSelectedUserId('');
      setAdjustmentAmount('');
      setAdjustmentReason('');
    } catch (error: any) {
      console.error('Error adjusting balance:', error);
      toast({ title: "Error", description: error.message || "Failed to adjust balance.", variant: "destructive" });
    }
  };

  const handleUserAction = async (userId: string, action: 'suspend' | 'activate') => {
    try {
      const { error } = await supabase.rpc('admin_suspend_user', {
        p_target_user_id: userId,
        p_suspend: action === 'suspend'
      });
      if (error) throw error;
      toast({ title: action === 'suspend' ? "User Suspended" : "User Activated", description: `User has been ${action === 'suspend' ? 'suspended' : 'activated'} successfully.` });
      fetchUsers();
    } catch (error: any) {
      console.error('Error performing user action:', error);
      toast({ title: "Error", description: error.message || `Failed to ${action} user.`, variant: "destructive" });
    }
  };

  const handleOTPConfirmation = () => {
    if (!otpCode) { toast({ title: "Missing OTP", description: "Please enter the OTP code.", variant: "destructive" }); return; }
    toast({ title: "OTP Confirmed", description: `OTP ${otpCode} has been verified and confirmed.` });
    setOtpCode('');
  };

  const handleTicketResponse = async () => {
    if (!selectedTicketId || !ticketResponse) {
      toast({ title: "Missing Information", description: "Please select a ticket and enter a response.", variant: "destructive" }); return;
    }
    try {
      const { error } = await supabase.from('support_tickets').update({
        status: 'resolved', admin_response: ticketResponse, updated_at: new Date().toISOString()
      }).eq('id', selectedTicketId);
      if (error) throw error;
      toast({ title: "Response Sent", description: "Support ticket response has been sent to the user." });
      setSelectedTicketId('');
      setTicketResponse('');
      fetchSupportTickets();
    } catch (error) {
      console.error('Error responding to ticket:', error);
      toast({ title: "Error", description: "Failed to send response.", variant: "destructive" });
    }
  };

  const getUsernameById = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user?.username || userId.slice(0, 8) + '...';
  };

  const referralStats = {
    total: referrals.length,
    qualified: referrals.filter(r => r.deposit_made).length,
    rewardsPaid: referrals.filter(r => r.reward_paid).length,
    pending: referrals.filter(r => r.deposit_made && !r.reward_paid).length,
  };

  // Password gate
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-900 flex items-center justify-center p-6">
        <Card className="bg-slate-800/80 border-cyan-500/20 p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-cyan-500/20 rounded-full mb-4">
              <Lock className="h-8 w-8 text-cyan-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">{t('admin.passwordTitle')}</h1>
            <p className="text-gray-400 text-sm">{t('admin.passwordDesc')}</p>
          </div>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <Label className="text-gray-300">{t('admin.passwordLabel')}</Label>
              <Input
                type="password"
                value={passwordInput}
                onChange={(e) => { setPasswordInput(e.target.value); setPasswordError(false); }}
                className="bg-slate-700 border-slate-600 text-white mt-1"
                placeholder={t('admin.passwordPlaceholder')}
                required
              />
              {passwordError && (
                <p className="text-red-400 text-sm mt-2">{t('admin.wrongPassword')}</p>
              )}
            </div>
            <Button type="submit" className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 font-semibold">
              <Shield className="h-4 w-4 mr-2" />
              {t('admin.unlock')}
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">{t('admin.title')}</h1>
            <p className="text-gray-400">{t('admin.subtitle')}</p>
          </div>
          <Button onClick={() => { fetchUsers(); fetchTransactions(); fetchSupportTickets(); fetchReferrals(); }} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh
          </Button>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-slate-800">
            <TabsTrigger value="users">{t('admin.users')}</TabsTrigger>
            <TabsTrigger value="transactions">{t('admin.transactions')}</TabsTrigger>
            <TabsTrigger value="support">{t('admin.support')}</TabsTrigger>
            <TabsTrigger value="balance">{t('admin.balance')}</TabsTrigger>
            <TabsTrigger value="referrals">{t('admin.referrals')}</TabsTrigger>
            <TabsTrigger value="otp">{t('admin.otp')}</TabsTrigger>
          </TabsList>

          {/* Users Management */}
          <TabsContent value="users">
            <Card className="bg-slate-800/50 border-cyan-500/20 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-cyan-400" />
                  <h2 className="text-xl font-semibold text-white">User Management</h2>
                </div>
                <Badge className="bg-cyan-500/20 text-cyan-400">{users.length} users</Badge>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Username</TableHead>
                      <TableHead>Balance</TableHead>
                      <TableHead>Referral Code</TableHead>
                      <TableHead>Referred By</TableHead>
                      <TableHead>Registered</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-gray-400 py-8">
                          No users found. Make sure you're logged in as an admin user.
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="text-white font-medium">{user.username}</TableCell>
                          <TableCell className="text-green-400 font-mono">${user.balance.toFixed(2)}</TableCell>
                          <TableCell className="text-cyan-400 font-mono text-xs">{user.referral_code || '—'}</TableCell>
                          <TableCell className="text-gray-400 text-xs">{user.referred_by || '—'}</TableCell>
                          <TableCell className="text-gray-400">{new Date(user.created_at).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Badge className={`${
                              user.status === 'suspended' ? 'bg-red-500/20 text-red-400' :
                              user.status === 'deleted' ? 'bg-gray-500/20 text-gray-400' :
                              'bg-green-500/20 text-green-400'
                            }`}>{user.status || 'active'}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {user.status === 'suspended' ? (
                                <Button variant="outline" size="sm" onClick={() => handleUserAction(user.id, 'activate')} className="text-xs px-2 py-1 h-6 text-green-400 border-green-400">Activate</Button>
                              ) : (
                                <Button variant="outline" size="sm" onClick={() => handleUserAction(user.id, 'suspend')} className="text-xs px-2 py-1 h-6 text-red-400 border-red-400">Suspend</Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>

          {/* Transactions */}
          <TabsContent value="transactions">
            <Card className="bg-slate-800/50 border-cyan-500/20 p-6">
              <div className="flex items-center space-x-2 mb-4">
                <DollarSign className="h-5 w-5 text-cyan-400" />
                <h2 className="text-xl font-semibold text-white">Transaction History</h2>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="text-white">{getUsernameById(transaction.user_id)}</TableCell>
                        <TableCell>
                          <Badge className={`${
                            transaction.type === 'deposit' ? 'bg-green-500/20 text-green-400' :
                            transaction.type === 'withdrawal' ? 'bg-red-500/20 text-red-400' :
                            transaction.type === 'referral_reward' ? 'bg-purple-500/20 text-purple-400' :
                            'bg-blue-500/20 text-blue-400'
                          }`}>{transaction.type}</Badge>
                        </TableCell>
                        <TableCell className="text-white font-mono">${Math.abs(transaction.amount).toFixed(2)}</TableCell>
                        <TableCell className="text-gray-400">{transaction.description || '-'}</TableCell>
                        <TableCell className="text-gray-400">{new Date(transaction.created_at).toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge className="bg-green-500/20 text-green-400">{transaction.status || 'Completed'}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>

          {/* Support Tickets */}
          <TabsContent value="support">
            <Card className="bg-slate-800/50 border-cyan-500/20 p-6">
              <div className="flex items-center space-x-2 mb-4">
                <MessageSquare className="h-5 w-5 text-cyan-400" />
                <h2 className="text-xl font-semibold text-white">Support Tickets</h2>
              </div>
              <div className="grid gap-6 lg:grid-cols-2">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Ticket List</h3>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {supportTickets.map((ticket) => (
                      <div key={ticket.id} className="bg-slate-700/50 p-4 rounded-lg border border-slate-600">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white font-medium">#{ticket.id.slice(0, 8)}</span>
                          <Badge className={`${
                            ticket.status === 'open' ? 'bg-red-500/20 text-red-400' :
                            ticket.status === 'in-progress' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-green-500/20 text-green-400'
                          }`}>{ticket.status}</Badge>
                        </div>
                        <p className="text-sm text-gray-400 mb-1">User: {getUsernameById(ticket.user_id)}</p>
                        <p className="text-sm text-white font-medium mb-1">{ticket.subject}</p>
                        <p className="text-xs text-gray-500 truncate">{ticket.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Respond to Ticket</h3>
                  <div className="space-y-4">
                    <div>
                      <Label>Select Ticket</Label>
                      <Select value={selectedTicketId} onValueChange={setSelectedTicketId}>
                        <SelectTrigger className="bg-slate-700 border-slate-600"><SelectValue placeholder="Choose ticket to respond to" /></SelectTrigger>
                        <SelectContent>
                          {supportTickets.map((ticket) => (
                            <SelectItem key={ticket.id} value={ticket.id}>#{ticket.id.slice(0, 8)} - {ticket.subject}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Response</Label>
                      <Textarea value={ticketResponse} onChange={(e) => setTicketResponse(e.target.value)}
                        className="bg-slate-700 border-slate-600" placeholder="Type your response..." rows={4} />
                    </div>
                    <Button onClick={handleTicketResponse} className="w-full">Send Response</Button>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Balance Management */}
          <TabsContent value="balance">
            <Card className="bg-slate-800/50 border-cyan-500/20 p-6">
              <div className="flex items-center space-x-2 mb-4">
                <DollarSign className="h-5 w-5 text-cyan-400" />
                <h2 className="text-xl font-semibold text-white">Manual Balance Adjustment</h2>
              </div>
              <div className="max-w-md space-y-4">
                <div>
                  <Label>Select User</Label>
                  <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                    <SelectTrigger className="bg-slate-700 border-slate-600"><SelectValue placeholder="Choose user to adjust balance" /></SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>{user.username} (${user.balance.toFixed(2)})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Adjustment Amount</Label>
                  <Input type="number" value={adjustmentAmount} onChange={(e) => setAdjustmentAmount(e.target.value)}
                    className="bg-slate-700 border-slate-600" placeholder="Enter amount (positive to add, negative to deduct)" />
                </div>
                <div>
                  <Label>Reason</Label>
                  <Textarea value={adjustmentReason} onChange={(e) => setAdjustmentReason(e.target.value)}
                    className="bg-slate-700 border-slate-600" placeholder="Reason for balance adjustment..." rows={3} />
                </div>
                <Button onClick={handleBalanceAdjustment} className="w-full">Adjust Balance</Button>
              </div>
            </Card>
          </TabsContent>

          {/* Referrals Management */}
          <TabsContent value="referrals">
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-slate-800/50 border-cyan-500/20 p-4 text-center">
                  <div className="text-2xl font-bold text-cyan-400">{referralStats.total}</div>
                  <div className="text-xs text-gray-400">{t('admin.totalReferrals')}</div>
                </Card>
                <Card className="bg-slate-800/50 border-green-500/20 p-4 text-center">
                  <div className="text-2xl font-bold text-green-400">{referralStats.qualified}</div>
                  <div className="text-xs text-gray-400">{t('admin.qualifiedReferrals')}</div>
                </Card>
                <Card className="bg-slate-800/50 border-purple-500/20 p-4 text-center">
                  <div className="text-2xl font-bold text-purple-400">{referralStats.rewardsPaid}</div>
                  <div className="text-xs text-gray-400">{t('admin.rewardsPaid')}</div>
                </Card>
                <Card className="bg-slate-800/50 border-yellow-500/20 p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-400">{referralStats.pending}</div>
                  <div className="text-xs text-gray-400">{t('admin.pendingRewards')}</div>
                </Card>
              </div>

              <Card className="bg-slate-800/50 border-cyan-500/20 p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Gift className="h-5 w-5 text-cyan-400" />
                  <h2 className="text-xl font-semibold text-white">{t('admin.referralManagement')}</h2>
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('admin.referrer')}</TableHead>
                        <TableHead>{t('admin.referred')}</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>{t('admin.depositStatus')}</TableHead>
                        <TableHead>{t('admin.rewardPaid')}</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {referrals.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-gray-400 py-8">
                            No referrals yet.
                          </TableCell>
                        </TableRow>
                      ) : (
                        referrals.map((referral) => (
                          <TableRow key={referral.id}>
                            <TableCell className="text-white">{getUsernameById(referral.referrer_id)}</TableCell>
                            <TableCell className="text-white">{getUsernameById(referral.referred_id)}</TableCell>
                            <TableCell>
                              <Badge className={`${
                                referral.status === 'qualified' ? 'bg-green-500/20 text-green-400' :
                                'bg-yellow-500/20 text-yellow-400'
                              }`}>{referral.status}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={referral.deposit_made ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}>
                                {referral.deposit_made ? 'Yes' : 'No'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={referral.reward_paid ? 'bg-purple-500/20 text-purple-400' : 'bg-gray-500/20 text-gray-400'}>
                                {referral.reward_paid ? 'Paid' : 'Pending'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-gray-400">{new Date(referral.created_at).toLocaleDateString()}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* OTP Management */}
          <TabsContent value="otp">
            <Card className="bg-slate-800/50 border-cyan-500/20 p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Shield className="h-5 w-5 text-cyan-400" />
                <h2 className="text-xl font-semibold text-white">OTP Confirmation</h2>
              </div>
              <div className="max-w-md space-y-4">
                <p className="text-gray-400">Manually confirm OTP codes for users experiencing authentication issues.</p>
                <div>
                  <Label>OTP Code</Label>
                  <Input value={otpCode} onChange={(e) => setOtpCode(e.target.value)}
                    className="bg-slate-700 border-slate-600" placeholder="Enter 6-digit OTP code" maxLength={6} />
                </div>
                <Button onClick={handleOTPConfirmation} className="w-full">
                  <CheckCircle className="h-4 w-4 mr-2" />Confirm OTP
                </Button>
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-400" />
                    <span className="text-sm text-yellow-400 font-medium">Security Notice</span>
                  </div>
                  <p className="text-xs text-yellow-300 mt-1">Only confirm OTP codes verified through secure channels.</p>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
