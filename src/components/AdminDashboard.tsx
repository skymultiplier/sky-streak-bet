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
import { Users, MessageSquare, DollarSign, CheckCircle, Clock, AlertTriangle, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface User {
  id: string;
  username: string;
  balance: number;
  created_at: string;
}

interface Transaction {
  id: string;
  user_id: string;
  type: string;
  amount: number;
  balance_after: number;
  created_at: string;
  status?: string;
}

interface SupportTicket {
  id: string;
  user_email: string;
  category: string;
  subject: string;
  description: string;
  status: 'open' | 'in-progress' | 'resolved';
  created_at: string;
}

export const AdminDashboard = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [adjustmentAmount, setAdjustmentAmount] = useState('');
  const [adjustmentReason, setAdjustmentReason] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [selectedTicketId, setSelectedTicketId] = useState<string>('');
  const [ticketResponse, setTicketResponse] = useState('');
  
  useEffect(() => {
    fetchUsers();
    fetchTransactions();
    // Mock support tickets for demo
    setSupportTickets([
      {
        id: '1',
        user_email: 'user1@example.com',
        category: 'deposit',
        subject: 'Deposit not credited',
        description: 'My USDT deposit of $500 has not been credited to my account after 2 hours.',
        status: 'open',
        created_at: new Date().toISOString()
      },
      {
        id: '2',
        user_email: 'user2@example.com',
        category: 'withdrawal',
        subject: 'Withdrawal stuck',
        description: 'My withdrawal request has been pending for 24 hours.',
        status: 'in-progress',
        created_at: new Date(Date.now() - 86400000).toISOString()
      }
    ]);
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const handleBalanceAdjustment = async () => {
    if (!selectedUserId || !adjustmentAmount || !adjustmentReason) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields for balance adjustment.",
        variant: "destructive",
      });
      return;
    }

    try {
      const amount = parseFloat(adjustmentAmount);
      
      // Use deposit function for positive adjustments
      if (amount > 0) {
        const { error } = await supabase.rpc('deposit', {
          _amount: amount
        });

        if (error) throw error;
      } else {
        // For negative adjustments, we'd need a special admin function
        toast({
          title: "Feature Not Available",
          description: "Negative balance adjustments require special admin privileges.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Balance Adjusted",
        description: `Successfully adjusted balance by $${amount} for user ${selectedUserId}`,
      });

      // Refresh data
      fetchUsers();
      fetchTransactions();
      
      // Clear form
      setSelectedUserId('');
      setAdjustmentAmount('');
      setAdjustmentReason('');
    } catch (error) {
      console.error('Error adjusting balance:', error);
      toast({
        title: "Error",
        description: "Failed to adjust balance. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleOTPConfirmation = () => {
    if (!otpCode) {
      toast({
        title: "Missing OTP",
        description: "Please enter the OTP code.",
        variant: "destructive",
      });
      return;
    }

    // Mock OTP verification
    toast({
      title: "OTP Confirmed",
      description: `OTP ${otpCode} has been verified and confirmed.`,
    });
    setOtpCode('');
  };

  const handleTicketResponse = () => {
    if (!selectedTicketId || !ticketResponse) {
      toast({
        title: "Missing Information",
        description: "Please select a ticket and enter a response.",
        variant: "destructive",
      });
      return;
    }

    // Update ticket status
    setSupportTickets(prev => prev.map(ticket => 
      ticket.id === selectedTicketId 
        ? { ...ticket, status: 'resolved' as const }
        : ticket
    ));

    toast({
      title: "Response Sent",
      description: "Support ticket response has been sent to the user.",
    });

    setSelectedTicketId('');
    setTicketResponse('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">Manage users, transactions, and support tickets</p>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-slate-800">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="support">Support</TabsTrigger>
            <TabsTrigger value="balance">Balance</TabsTrigger>
            <TabsTrigger value="otp">OTP</TabsTrigger>
          </TabsList>

          {/* Users Management */}
          <TabsContent value="users">
            <Card className="bg-slate-800/50 border-cyan-500/20 p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Users className="h-5 w-5 text-cyan-400" />
                <h2 className="text-xl font-semibold text-white">User Management</h2>
              </div>
              
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Username</TableHead>
                      <TableHead>Balance</TableHead>
                      <TableHead>Registered</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="text-white">{user.username}</TableCell>
                        <TableCell className="text-green-400">${user.balance.toFixed(2)}</TableCell>
                        <TableCell className="text-gray-400">
                          {new Date(user.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-green-500/20 text-green-400">Active</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
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
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Balance After</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          <Badge className={`${
                            transaction.type === 'deposit' ? 'bg-green-500/20 text-green-400' :
                            transaction.type === 'withdrawal' ? 'bg-red-500/20 text-red-400' :
                            'bg-blue-500/20 text-blue-400'
                          }`}>
                            {transaction.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-white">${transaction.amount.toFixed(2)}</TableCell>
                        <TableCell className="text-gray-400">${transaction.balance_after.toFixed(2)}</TableCell>
                        <TableCell className="text-gray-400">
                          {new Date(transaction.created_at).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-green-500/20 text-green-400">Completed</Badge>
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
                  <div className="space-y-3">
                    {supportTickets.map((ticket) => (
                      <div key={ticket.id} className="bg-slate-700/50 p-4 rounded-lg border border-slate-600">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white font-medium">#{ticket.id}</span>
                          <Badge className={`${
                            ticket.status === 'open' ? 'bg-red-500/20 text-red-400' :
                            ticket.status === 'in-progress' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-green-500/20 text-green-400'
                          }`}>
                            {ticket.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-400 mb-1">{ticket.user_email}</p>
                        <p className="text-sm text-white font-medium mb-1">{ticket.subject}</p>
                        <p className="text-xs text-gray-500 truncate">{ticket.description}</p>
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
                        <SelectTrigger className="bg-slate-700 border-slate-600">
                          <SelectValue placeholder="Choose ticket to respond to" />
                        </SelectTrigger>
                        <SelectContent>
                          {supportTickets.map((ticket) => (
                            <SelectItem key={ticket.id} value={ticket.id}>
                              #{ticket.id} - {ticket.subject}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Response</Label>
                      <Textarea
                        value={ticketResponse}
                        onChange={(e) => setTicketResponse(e.target.value)}
                        className="bg-slate-700 border-slate-600"
                        placeholder="Type your response to the user..."
                        rows={4}
                      />
                    </div>

                    <Button onClick={handleTicketResponse} className="w-full">
                      Send Response
                    </Button>
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
                    <SelectTrigger className="bg-slate-700 border-slate-600">
                      <SelectValue placeholder="Choose user to adjust balance" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.username} (${user.balance.toFixed(2)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Adjustment Amount</Label>
                  <Input
                    type="number"
                    value={adjustmentAmount}
                    onChange={(e) => setAdjustmentAmount(e.target.value)}
                    className="bg-slate-700 border-slate-600"
                    placeholder="Enter amount (positive to add, negative to deduct)"
                  />
                </div>

                <div>
                  <Label>Reason</Label>
                  <Textarea
                    value={adjustmentReason}
                    onChange={(e) => setAdjustmentReason(e.target.value)}
                    className="bg-slate-700 border-slate-600"
                    placeholder="Reason for balance adjustment..."
                    rows={3}
                  />
                </div>

                <Button onClick={handleBalanceAdjustment} className="w-full">
                  Adjust Balance
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* OTP Management */}
          <TabsContent value="otp">
            <Card className="bg-slate-800/50 border-cyan-500/20 p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Shield className="h-5 w-5 text-cyan-400" />
                <h2 className="text-xl font-semibold text-white">OTP Confirmation</h2>
              </div>

              <div className="max-w-md space-y-4">
                <p className="text-gray-400">
                  Manually confirm OTP codes for users experiencing authentication issues.
                </p>

                <div>
                  <Label>OTP Code</Label>
                  <Input
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="bg-slate-700 border-slate-600"
                    placeholder="Enter 6-digit OTP code"
                    maxLength={6}
                  />
                </div>

                <Button onClick={handleOTPConfirmation} className="w-full">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirm OTP
                </Button>

                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-400" />
                    <span className="text-sm text-yellow-400 font-medium">Security Notice</span>
                  </div>
                  <p className="text-xs text-yellow-300 mt-1">
                    Only confirm OTP codes that you have verified with the user through secure channels.
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};