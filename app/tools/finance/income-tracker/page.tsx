'use client';

import { useState } from 'react';
import { DollarSign, Plus, TrendingUp, TrendingDown, Calendar, PieChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { StatsGrid } from '@/components/ui/stats-grid';
import { ToolLayout } from '@/components/ui/tool-layout';
import { useLocalStorage } from '@/lib/use-local-storage';
import { generateId } from '@/lib/id';
import { toLocalDateString } from '@/lib/utils';
import { toast } from 'sonner';

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string;
}

const incomeCategories = [
  'Salary', 'Freelance', 'Business', 'Investment', 'Gift', 'Other Income'
];

const expenseCategories = [
  'Food & Dining', 'Transportation', 'Shopping', 'Entertainment', 'Bills & Utilities',
  'Healthcare', 'Education', 'Travel', 'Insurance', 'Savings', 'Other Expense'
];

export default function IncomeTrackerPage() {
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>('incomeTracker', []);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newTransaction, setNewTransaction] = useState<Partial<Transaction>>({
    type: 'expense',
    amount: 0,
    category: '',
    description: '',
    date: toLocalDateString()
  });
  const [filterMonth, setFilterMonth] = useState(new Date().toISOString().slice(0, 7));

  const addTransaction = () => {
    if (!newTransaction.amount || newTransaction.amount <= 0 || !newTransaction.category || !newTransaction.description) {
      toast.error('Please fill in all fields with a valid amount');
      return;
    }

    const transaction: Transaction = {
      id: generateId(),
      type: newTransaction.type!,
      amount: newTransaction.amount!,
      category: newTransaction.category!,
      description: newTransaction.description!,
      date: newTransaction.date!
    };

    setTransactions([transaction, ...transactions]);
    setNewTransaction({
      type: 'expense',
      amount: 0,
      category: '',
      description: '',
      date: toLocalDateString()
    });
    setIsAddingNew(false);
    toast.success('Transaction added successfully!');
  };

  const getFilteredTransactions = () => {
    return transactions.filter(t => t.date.slice(0, 7) === filterMonth);
  };

  const getMonthlyStats = () => {
    const filtered = getFilteredTransactions();
    const income = filtered.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expenses = filtered.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const balance = income - expenses;
    
    return { income, expenses, balance };
  };

  const getCategoryBreakdown = () => {
    const filtered = getFilteredTransactions().filter(t => t.type === 'expense');
    const breakdown: Record<string, number> = {};

    filtered.forEach(t => {
      breakdown[t.category] = (breakdown[t.category] || 0) + t.amount;
    });
    
    return Object.entries(breakdown)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
  };

  const getSavingsRate = () => {
    const { income, expenses } = getMonthlyStats();
    if (income === 0) return 0;
    return ((income - expenses) / income * 100).toFixed(1);
  };

  const getSpendingTrend = () => {
    const [year, month] = filterMonth.split('-').map(Number);
    const previousMonthDate = new Date(year, month - 2, 1);
    const previousMonth = `${previousMonthDate.getFullYear()}-${(previousMonthDate.getMonth() + 1).toString().padStart(2, '0')}`;

    const currentExpenses = transactions
      .filter(t => t.date.slice(0, 7) === filterMonth && t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const previousExpenses = transactions
      .filter(t => t.date.slice(0, 7) === previousMonth && t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    if (previousExpenses === 0) return '0';
    return ((currentExpenses - previousExpenses) / previousExpenses * 100).toFixed(1);
  };

  const stats = getMonthlyStats();
  const categoryBreakdown = getCategoryBreakdown();
  const savingsRate = getSavingsRate();
  const spendingTrend = parseFloat(getSpendingTrend());

  const instructions = [
    'Add your income and expenses with categories and descriptions',
    'Use the month filter to view specific time periods',
    'Monitor your savings rate and spending trends',
    'Track top spending categories to identify areas for improvement'
  ];

  return (
    <ToolLayout
      title="Income & Expense Tracker"
      description="Visual tracking of your income, expenses, and savings with category breakdowns"
      instructions={instructions}
    >
      <div className="space-y-6">
        {/* Controls */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="space-y-1">
              <Label htmlFor="filter-month" className="text-xs">Filter by Month</Label>
              <Input
                id="filter-month"
                type="month"
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="w-40"
              />
            </div>
          </div>
          <Dialog open={isAddingNew} onOpenChange={setIsAddingNew}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Transaction
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Transaction</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label htmlFor="transaction-type">Type</Label>
                    <Select
                      value={newTransaction.type}
                      onValueChange={(value) => setNewTransaction({...newTransaction, type: value as 'income' | 'expense', category: ''})}
                    >
                      <SelectTrigger id="transaction-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="income">Income</SelectItem>
                        <SelectItem value="expense">Expense</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="transaction-amount">Amount</Label>
                    <Input
                      id="transaction-amount"
                      type="number"
                      min={0}
                      step="0.01"
                      placeholder="0.00"
                      value={newTransaction.amount || ''}
                      onChange={(e) => setNewTransaction({...newTransaction, amount: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="transaction-category">Category</Label>
                  <Select
                    value={newTransaction.category}
                    onValueChange={(value) => setNewTransaction({...newTransaction, category: value})}
                  >
                    <SelectTrigger id="transaction-category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {(newTransaction.type === 'income' ? incomeCategories : expenseCategories).map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="transaction-description">Description</Label>
                  <Input
                    id="transaction-description"
                    placeholder="Brief description..."
                    value={newTransaction.description || ''}
                    onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="transaction-date">Date</Label>
                  <Input
                    id="transaction-date"
                    type="date"
                    value={newTransaction.date || ''}
                    onChange={(e) => setNewTransaction({...newTransaction, date: e.target.value})}
                  />
                </div>
                <Button onClick={addTransaction} className="w-full">
                  Add Transaction
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Monthly Overview */}
        <StatsGrid
          variant="cards"
          stats={[
            {
              label: 'Income', icon: TrendingUp, iconClassName: 'text-green-500', value: `$${stats.income.toLocaleString()}`,
              valueClassName: 'text-green-600', caption: 'This month',
            },
            {
              label: 'Expenses', icon: TrendingDown, iconClassName: 'text-red-500', value: `$${stats.expenses.toLocaleString()}`,
              valueClassName: 'text-red-600',
              caption: `${spendingTrend > 0 ? '↗️' : spendingTrend < 0 ? '↘️' : '→'} ${Math.abs(spendingTrend)}% vs last month`,
            },
            {
              label: 'Balance', icon: DollarSign, iconClassName: 'text-blue-500', value: `$${stats.balance.toLocaleString()}`,
              valueClassName: stats.balance >= 0 ? 'text-green-600' : 'text-red-600', caption: 'Net this month',
            },
            {
              label: 'Savings Rate', icon: PieChart, iconClassName: 'text-purple-500', value: `${savingsRate}%`,
              valueClassName: 'text-purple-600', caption: 'Of income saved',
            },
          ]}
        />

        {/* Category Breakdown */}
        {categoryBreakdown.length > 0 && (
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-sm">Top Spending Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {categoryBreakdown.map(([category, amount]) => (
                  <div key={category} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{category}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-muted rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: stats.expenses > 0 ? `${(amount / stats.expenses) * 100}%` : '0%' }}
                        />
                      </div>
                      <span className="text-sm font-mono">${amount.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Transactions */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-sm">Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {getFilteredTransactions().length > 0 ? (
              <div className="space-y-3">
                {getFilteredTransactions().slice(0, 10).map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <Badge variant={transaction.type === 'income' ? 'default' : 'secondary'}>
                          {transaction.type}
                        </Badge>
                        <span className="text-sm font-medium">{transaction.category}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{transaction.description}</p>
                      <p className="text-xs text-muted-foreground">{transaction.date}</p>
                    </div>
                    <div className={`text-lg font-bold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No transactions yet</h3>
                <p className="text-muted-foreground mb-4">Start tracking your income and expenses to see insights.</p>
                <Button onClick={() => setIsAddingNew(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Transaction
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Financial Tips */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-sm">Smart Money Tips</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              <strong>50/30/20 Rule:</strong> Allocate 50% for needs, 30% for wants, and 20% for savings and debt repayment.
            </p>
            <p>
              <strong>Track Daily:</strong> Regular tracking helps identify spending patterns and unnecessary expenses.
            </p>
            <p>
              <strong>Emergency Fund:</strong> Aim to save 3-6 months of expenses for unexpected situations.
            </p>
            <p>
              <strong>Review Monthly:</strong> Analyze your spending categories to find areas for improvement.
            </p>
          </CardContent>
        </Card>
      </div>
    </ToolLayout>
  );
}