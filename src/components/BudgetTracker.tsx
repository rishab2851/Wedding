import React, { useState, useMemo } from 'react';
import {
  WeddingEvent,
  WEDDING_EVENTS,
  Expense,
  FamilyMember,
  WeddingSettings,
} from '../types';
import { HeroCountdownCard } from './HeroCountdownCard';
import { CircularDonutChart, formatIndianRupee } from './CircularDonutChart';
import {
  PlusCircle,
  IndianRupee,
  Wallet,
  PiggyBank,
  TrendingUp,
  Filter,
  Trash2,
  Edit2,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  User,
  Layers,
  Search,
} from 'lucide-react';

interface BudgetTrackerProps {
  settings: WeddingSettings;
  budgets: Record<WeddingEvent, number>;
  expenses: Expense[];
  familyMembers: FamilyMember[];
  onUpdateBudgets: (newBudgets: Record<WeddingEvent, number>) => void;
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
  onDeleteExpense: (expenseId: string) => void;
  onOpenSettings: () => void;
}

export const BudgetTracker: React.FC<BudgetTrackerProps> = ({
  settings,
  budgets,
  expenses,
  familyMembers,
  onUpdateBudgets,
  onAddExpense,
  onDeleteExpense,
  onOpenSettings,
}) => {
  // Add Expense form state
  const [selectedEvent, setSelectedEvent] = useState<WeddingEvent>('Mehendi / Ghee Pilayi');
  const [expenseName, setExpenseName] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [paidBy, setPaidBy] = useState(familyMembers[0]?.name || 'Rajesh Chordia');
  const [comment, setComment] = useState('');
  const [formSuccessMessage, setFormSuccessMessage] = useState('');

  // Set Event Budgets section state (editable copy)
  const [editableBudgets, setEditableBudgets] = useState<Record<WeddingEvent, string>>(() => {
    const initial: Record<string, string> = {};
    WEDDING_EVENTS.forEach((ev) => {
      initial[ev] = String(budgets[ev] || 0);
    });
    return initial as Record<WeddingEvent, string>;
  });
  const [budgetSaveMessage, setBudgetSaveMessage] = useState('');
  const [isBudgetEditingOpen, setIsBudgetEditingOpen] = useState(false);

  // Selected filter event for All Expenses view
  const [filterEvent, setFilterEvent] = useState<WeddingEvent | 'ALL'>('ALL');
  const [expenseSearchQuery, setExpenseSearchQuery] = useState('');

  // Spent by Person state
  const [selectedPerson, setSelectedPerson] = useState<string>(
    familyMembers[0]?.name || 'Rajesh Chordia'
  );
  const [openPersonAccordions, setOpenPersonAccordions] = useState<Record<string, boolean>>({});

  // Sync editable budgets if parent budgets change
  React.useEffect(() => {
    const updated: Record<string, string> = {};
    WEDDING_EVENTS.forEach((ev) => {
      updated[ev] = String(budgets[ev] || 0);
    });
    setEditableBudgets(updated as Record<WeddingEvent, string>);
  }, [budgets]);

  // Calculations for each event
  const eventSpendMap = useMemo(() => {
    const map: Record<WeddingEvent, number> = {
      'Mehendi / Ghee Pilayi': 0,
      'Carnival': 0,
      'Haldi': 0,
      'Sangeet': 0,
      'Mayra': 0,
      'Dora Padla': 0,
      'Wedding Ceremony': 0,
      'Reception': 0,
    };
    expenses.forEach((exp) => {
      if (map[exp.event] !== undefined) {
        map[exp.event] += Number(exp.amount) || 0;
      }
    });
    return map;
  }, [expenses]);

  // Overall totals
  const totalBudget = useMemo(() => {
    return WEDDING_EVENTS.reduce((sum, ev) => sum + (budgets[ev] || 0), 0);
  }, [budgets]);

  const totalSpent = useMemo(() => {
    return expenses.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);
  }, [expenses]);

  const totalRemaining = totalBudget - totalSpent;
  const overallPercentage = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  // Handle Add Expense submission
  const handleAddExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(expenseAmount);
    if (!expenseName.trim() || isNaN(numAmount) || numAmount <= 0) {
      return;
    }

    onAddExpense({
      event: selectedEvent,
      name: expenseName.trim(),
      amount: numAmount,
      paidBy: paidBy || familyMembers[0]?.name || 'Family Member',
      comment: comment.trim() || undefined,
      date: new Date().toISOString().slice(0, 10),
    });

    setExpenseName('');
    setExpenseAmount('');
    setComment('');
    setFormSuccessMessage(`Added ₹${numAmount.toLocaleString('en-IN')} for ${selectedEvent}`);
    setTimeout(() => setFormSuccessMessage(''), 4000);
  };

  // Handle saving budgets
  const handleSaveBudgets = () => {
    const newBudgets: Record<string, number> = {};
    WEDDING_EVENTS.forEach((ev) => {
      const val = parseFloat(editableBudgets[ev]) || 0;
      newBudgets[ev] = Math.max(0, val);
    });
    onUpdateBudgets(newBudgets as Record<WeddingEvent, number>);
    setBudgetSaveMessage('Event budgets updated successfully!');
    setTimeout(() => setBudgetSaveMessage(''), 3000);
  };

  // Grouped expenses for "All Expenses"
  const filteredExpenses = useMemo(() => {
    return expenses.filter((exp) => {
      const matchesEvent = filterEvent === 'ALL' || exp.event === filterEvent;
      const matchesSearch =
        !expenseSearchQuery ||
        exp.name.toLowerCase().includes(expenseSearchQuery.toLowerCase()) ||
        exp.paidBy.toLowerCase().includes(expenseSearchQuery.toLowerCase()) ||
        (exp.comment && exp.comment.toLowerCase().includes(expenseSearchQuery.toLowerCase()));
      return matchesEvent && matchesSearch;
    });
  }, [expenses, filterEvent, expenseSearchQuery]);

  const expensesByEvent = useMemo(() => {
    const grouped: Record<WeddingEvent, Expense[]> = {
      'Mehendi / Ghee Pilayi': [],
      'Carnival': [],
      'Haldi': [],
      'Sangeet': [],
      'Mayra': [],
      'Dora Padla': [],
      'Wedding Ceremony': [],
      'Reception': [],
    };
    filteredExpenses.forEach((exp) => {
      if (grouped[exp.event]) {
        grouped[exp.event].push(exp);
      }
    });
    return grouped;
  }, [filteredExpenses]);

  // "Spent by Person" calculations
  const personExpenses = useMemo(() => {
    return expenses.filter(
      (exp) => exp.paidBy.toLowerCase() === selectedPerson.toLowerCase()
    );
  }, [expenses, selectedPerson]);

  const personTotalSpent = useMemo(() => {
    return personExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  }, [personExpenses]);

  const personExpensesByEvent = useMemo(() => {
    const grouped: Record<WeddingEvent, Expense[]> = {
      'Mehendi / Ghee Pilayi': [],
      'Carnival': [],
      'Haldi': [],
      'Sangeet': [],
      'Mayra': [],
      'Dora Padla': [],
      'Wedding Ceremony': [],
      'Reception': [],
    };
    personExpenses.forEach((exp) => {
      if (grouped[exp.event]) {
        grouped[exp.event].push(exp);
      }
    });
    return grouped;
  }, [personExpenses]);

  const togglePersonAccordion = (event: string) => {
    setOpenPersonAccordions((prev) => ({
      ...prev,
      [event]: !prev[event],
    }));
  };

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Hero Countdown Card at the top */}
      <HeroCountdownCard settings={settings} onOpenSettings={onOpenSettings} />

      {/* Overall Financial Health Summary Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl luxury-card flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FAF0E6] flex items-center justify-center text-[#8C6221] shrink-0">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] uppercase tracking-wider text-[#8C7A6B] block">
              Total Budget
            </span>
            <span className="text-base sm:text-lg font-bold font-serif-heading text-[#2C2420]">
              {formatIndianRupee(totalBudget)}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl luxury-card flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FDF2F0] flex items-center justify-center text-[#B2503A] shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] uppercase tracking-wider text-[#8C7A6B] block">
              Total Spent
            </span>
            <span className="text-base sm:text-lg font-bold font-serif-heading text-[#B2503A]">
              {formatIndianRupee(totalSpent)}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl luxury-card flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#EFF8F2] flex items-center justify-center text-emerald-700 shrink-0">
            <PiggyBank className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] uppercase tracking-wider text-[#8C7A6B] block">
              {totalRemaining >= 0 ? 'Remaining' : 'Overrun'}
            </span>
            <span
              className={`text-base sm:text-lg font-bold font-serif-heading ${
                totalRemaining >= 0 ? 'text-emerald-700' : 'text-rose-600'
              }`}
            >
              {formatIndianRupee(Math.abs(totalRemaining))}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl luxury-card flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FAF4EA] flex items-center justify-center text-[#C5A059] shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="w-full">
            <div className="flex items-center justify-between text-[11px] text-[#8C7A6B] uppercase tracking-wider mb-1">
              <span>Utilized</span>
              <span className="font-bold text-[#2C2420]">{overallPercentage}%</span>
            </div>
            <div className="w-full bg-[#EFE9DF] h-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  overallPercentage > 100
                    ? 'bg-rose-600'
                    : overallPercentage > 85
                    ? 'bg-[#C86D51]'
                    : 'bg-[#C5A059]'
                }`}
                style={{ width: `${Math.min(overallPercentage, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Budget Overview: Donut/Circular Charts — ONE per event */}
      <section id="budget-overview-section" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-[#E8D7C3] pb-3">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-[#B2503A] mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Event Breakdown</span>
            </div>
            <h2 className="font-serif-heading text-2xl sm:text-3xl font-bold text-[#2C2420]">
              Budget Overview by Event
            </h2>
            <p className="text-xs sm:text-sm text-[#7A6B60] mt-0.5">
              Live circular metrics for each of the 8 wedding ceremonies and celebrations
            </p>
          </div>

          <div className="text-xs text-[#8C7A6B] flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#C5A059] inline-block" />
            <span>On Budget</span>
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 inline-block ml-2" />
            <span>Over Budget</span>
          </div>
        </div>

        {/* 8 Event Donut Charts Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {WEDDING_EVENTS.map((event) => (
            <CircularDonutChart
              key={event}
              event={event}
              budget={budgets[event] || 0}
              spent={eventSpendMap[event] || 0}
              isSelected={filterEvent === event}
              onFilterClick={(ev) => {
                setFilterEvent((prev) => (prev === ev ? 'ALL' : ev));
                // Scroll down to All Expenses smoothly
                const el = document.getElementById('all-expenses-section');
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            />
          ))}
        </div>
      </section>

      {/* 3. Add Expense Form */}
      <section
        id="add-expense-section"
        className="luxury-card rounded-3xl p-6 md:p-8 bg-gradient-to-br from-[#FFFFFF] via-[#FDFBF7] to-[#FAF5EE]"
      >
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF0E6] text-[#8C6221] text-xs font-medium mb-2 border border-[#E8D7C3]">
            <PlusCircle className="w-3.5 h-3.5" />
            <span>New Payment Entry</span>
          </div>
          <h2 className="font-serif-heading text-2xl md:text-3xl font-bold text-[#2C2420]">
            Add Wedding Expense
          </h2>
          <p className="text-xs sm:text-sm text-[#7A6B60] mb-6">
            Log bills, advances, vendor fees, and shopping to automatically update event budgets.
          </p>

          <form onSubmit={handleAddExpenseSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Event dropdown */}
              <div>
                <label
                  htmlFor="expense-event-select"
                  className="block text-xs font-semibold uppercase tracking-wider text-[#7A6B60] mb-1.5"
                >
                  Select Event *
                </label>
                <select
                  id="expense-event-select"
                  value={selectedEvent}
                  onChange={(e) => setSelectedEvent(e.target.value as WeddingEvent)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#D9C8B5] rounded-xl text-sm font-medium text-[#2C2420] focus:outline-none focus:ring-2 focus:ring-[#B2503A]/50 shadow-sm"
                  required
                >
                  {WEDDING_EVENTS.map((ev) => (
                    <option key={ev} value={ev}>
                      {ev}
                    </option>
                  ))}
                </select>
              </div>

              {/* Paid By dropdown */}
              <div>
                <label
                  htmlFor="expense-paid-by-select"
                  className="block text-xs font-semibold uppercase tracking-wider text-[#7A6B60] mb-1.5"
                >
                  Paid By (Family Member) *
                </label>
                <select
                  id="expense-paid-by-select"
                  value={paidBy}
                  onChange={(e) => setPaidBy(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#D9C8B5] rounded-xl text-sm font-medium text-[#2C2420] focus:outline-none focus:ring-2 focus:ring-[#B2503A]/50 shadow-sm"
                  required
                >
                  {familyMembers.map((member) => (
                    <option key={member.id} value={member.name}>
                      {member.name} ({member.relationRole})
                    </option>
                  ))}
                </select>
              </div>

              {/* Expense Name text */}
              <div>
                <label
                  htmlFor="expense-name-input"
                  className="block text-xs font-semibold uppercase tracking-wider text-[#7A6B60] mb-1.5"
                >
                  Expense Name / Vendor Description *
                </label>
                <input
                  id="expense-name-input"
                  type="text"
                  placeholder="e.g. Sangeet LED wall & DJ sound advance"
                  value={expenseName}
                  onChange={(e) => setExpenseName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#D9C8B5] rounded-xl text-sm text-[#2C2420] focus:outline-none focus:ring-2 focus:ring-[#B2503A]/50 shadow-sm"
                  required
                />
              </div>

              {/* Amount (₹) */}
              <div>
                <label
                  htmlFor="expense-amount-input"
                  className="block text-xs font-semibold uppercase tracking-wider text-[#7A6B60] mb-1.5"
                >
                  Amount (₹ Indian Rupee) *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C7A6B]">
                    <span className="font-semibold text-sm">₹</span>
                  </div>
                  <input
                    id="expense-amount-input"
                    type="number"
                    min="1"
                    step="1"
                    placeholder="e.g. 75000"
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(e.target.value)}
                    className="w-full pl-8 pr-3.5 py-2.5 bg-white border border-[#D9C8B5] rounded-xl text-sm font-semibold text-[#2C2420] focus:outline-none focus:ring-2 focus:ring-[#B2503A]/50 shadow-sm"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Comment (optional) */}
            <div>
              <label
                htmlFor="expense-comment-input"
                className="block text-xs font-semibold uppercase tracking-wider text-[#7A6B60] mb-1.5"
              >
                Comment / Remarks / Invoice Number (Optional)
              </label>
              <input
                id="expense-comment-input"
                type="text"
                placeholder="e.g. Paid via RTGS transaction #92841, balance due at stage setup"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-[#D9C8B5] rounded-xl text-sm text-[#2C2420] focus:outline-none focus:ring-2 focus:ring-[#B2503A]/50 shadow-sm"
              />
            </div>

            {/* Form actions and feedback */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              {formSuccessMessage ? (
                <div className="inline-flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{formSuccessMessage}</span>
                </div>
              ) : (
                <span className="text-xs text-[#8C7A6B]">
                  * All registered family members can view and update expenses
                </span>
              )}

              <button
                id="expense-submit-btn"
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#B2503A] to-[#8F3B27] hover:from-[#A0422D] hover:to-[#7E301F] text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Save Expense</span>
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* 4. Set Event Budgets Section */}
      <section id="set-budgets-section" className="luxury-card rounded-3xl p-6 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-[#B2503A] mb-1">
              <IndianRupee className="w-3.5 h-3.5" />
              <span>Budget Planning</span>
            </div>
            <h2 className="font-serif-heading text-2xl font-bold text-[#2C2420]">
              Set Event Budgets
            </h2>
            <p className="text-xs sm:text-sm text-[#7A6B60]">
              Simple input fields to allocate and adjust planned funds for each ceremony
            </p>
          </div>

          <button
            id="toggle-budget-edit-btn"
            onClick={() => setIsBudgetEditingOpen(!isBudgetEditingOpen)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FAF0E6] hover:bg-[#F3E2D2] text-[#8C6221] text-xs font-semibold border border-[#E0CFBD] transition-colors self-start sm:self-auto"
          >
            {isBudgetEditingOpen ? (
              <>
                <ChevronUp className="w-4 h-4" />
                <span>Collapse Budget Editor</span>
              </>
            ) : (
              <>
                <Edit2 className="w-4 h-4" />
                <span>Edit Event Budgets ({formatIndianRupee(totalBudget)})</span>
              </>
            )}
          </button>
        </div>

        {/* Expandable budget inputs */}
        {isBudgetEditingOpen && (
          <div className="mt-4 pt-4 border-t border-[#F0E6DA] space-y-6 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {WEDDING_EVENTS.map((event) => (
                <div
                  key={event}
                  className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E8DDD1]"
                >
                  <label
                    htmlFor={`budget-input-${event.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                    className="block text-xs font-semibold text-[#2C2420] mb-1.5 truncate"
                    title={event}
                  >
                    {event}
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs text-[#8C7A6B] font-medium">
                      ₹
                    </span>
                    <input
                      id={`budget-input-${event.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                      type="number"
                      min="0"
                      step="10000"
                      value={editableBudgets[event]}
                      onChange={(e) =>
                        setEditableBudgets({
                          ...editableBudgets,
                          [event]: e.target.value,
                        })
                      }
                      className="w-full pl-7 pr-3 py-1.5 text-sm font-semibold text-[#2C2420] bg-white border border-[#D9C8B5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B2503A]/40"
                    />
                  </div>
                  <div className="text-[10px] text-[#8C7A6B] mt-1 flex justify-between">
                    <span>Spent:</span>
                    <span className="font-medium text-[#2C2420]">
                      {formatIndianRupee(eventSpendMap[event] || 0)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div className="text-xs text-[#7A6B60]">
                {budgetSaveMessage ? (
                  <span className="text-emerald-700 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    {budgetSaveMessage}
                  </span>
                ) : (
                  <span>
                    New Combined Allocation:{' '}
                    <strong className="text-[#2C2420]">
                      {formatIndianRupee(
                        Object.values(editableBudgets).reduce(
                          (sum, v) => sum + (parseFloat(v) || 0),
                          0
                        )
                      )}
                    </strong>
                  </span>
                )}
              </div>

              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  id="save-event-budgets-btn"
                  onClick={handleSaveBudgets}
                  className="w-full sm:w-auto px-6 py-2 rounded-xl bg-[#8C6221] hover:bg-[#73501A] text-white text-xs font-semibold shadow transition-colors flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Update All Budgets</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 5. All Expenses — grouped by event, showing expense name, amount, paid by, comment, with a subtotal per event */}
      <section id="all-expenses-section" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8D7C3] pb-3">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-[#B2503A] mb-1">
              <Layers className="w-3.5 h-3.5" />
              <span>Financial Ledger</span>
            </div>
            <h2 className="font-serif-heading text-2xl sm:text-3xl font-bold text-[#2C2420]">
              All Expenses (Grouped by Event)
            </h2>
            <p className="text-xs sm:text-sm text-[#7A6B60]">
              Complete itemized registry with event subtotals and payer breakdown
            </p>
          </div>

          {/* Quick filter pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              id="filter-event-all-btn"
              onClick={() => setFilterEvent('ALL')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                filterEvent === 'ALL'
                  ? 'bg-[#2C2420] text-white'
                  : 'bg-white text-[#7A6B60] border border-[#E0D5C9] hover:bg-[#F5EFE6]'
              }`}
            >
              All Events ({expenses.length})
            </button>
            {filterEvent !== 'ALL' && (
              <span className="px-2.5 py-1 rounded-full text-xs bg-[#FAF0E6] text-[#8C6221] border border-[#E0CFBD] font-medium flex items-center gap-1">
                <span>Filtering: {filterEvent}</span>
                <button
                  onClick={() => setFilterEvent('ALL')}
                  className="hover:text-red-700 ml-1 font-bold"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        </div>

        {/* Search bar inside ledger */}
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C7A6B]" />
          <input
            id="expense-search-input"
            type="text"
            placeholder="Search expense by name, person or remark..."
            value={expenseSearchQuery}
            onChange={(e) => setExpenseSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-white border border-[#D9C8B5] rounded-xl text-[#2C2420] focus:outline-none focus:ring-2 focus:ring-[#B2503A]/40"
          />
        </div>

        {/* Expenses List Grouped by Event */}
        <div className="space-y-6">
          {WEDDING_EVENTS.map((event) => {
            const eventExpenses = expensesByEvent[event] || [];
            if (filterEvent !== 'ALL' && filterEvent !== event) return null;
            if (filterEvent === 'ALL' && eventExpenses.length === 0 && expenseSearchQuery) {
              return null;
            }

            const eventSubtotal = eventExpenses.reduce((sum, exp) => sum + exp.amount, 0);
            const eventBudget = budgets[event] || 0;
            const isEventOver = eventSubtotal > eventBudget;

            return (
              <div
                key={event}
                id={`event-expenses-group-${event.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                className="luxury-card rounded-2xl overflow-hidden border border-[#E8DDD1]"
              >
                {/* Event header & subtotal bar */}
                <div className="bg-[#FAF6F0] p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E8DDD1]">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#B2503A]" />
                    <h3 className="font-serif-heading text-lg font-bold text-[#2C2420]">
                      {event}
                    </h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white text-[#7A6B60] border border-[#E0D5C9]">
                      {eventExpenses.length} {eventExpenses.length === 1 ? 'item' : 'items'}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs sm:text-sm">
                    <div className="text-right">
                      <span className="text-[#8C7A6B] block text-[11px] uppercase tracking-wider">
                        Event Subtotal
                      </span>
                      <span className="font-bold text-base text-[#2C2420]">
                        {formatIndianRupee(eventSubtotal)}
                      </span>
                    </div>

                    <div className="hidden sm:block text-right pl-3 border-l border-[#E2D5C8]">
                      <span className="text-[#8C7A6B] block text-[11px] uppercase tracking-wider">
                        Budget Status
                      </span>
                      <span
                        className={`font-semibold text-xs ${
                          isEventOver ? 'text-rose-600' : 'text-emerald-700'
                        }`}
                      >
                        {isEventOver
                          ? `Over by ${formatIndianRupee(eventSubtotal - eventBudget)}`
                          : `${formatIndianRupee(eventBudget - eventSubtotal)} remaining`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Items in this event */}
                {eventExpenses.length === 0 ? (
                  <div className="p-6 text-center text-xs text-[#8C7A6B] italic">
                    No expenses logged for {event} yet. Use the "Add Expense" form above.
                  </div>
                ) : (
                  <div className="divide-y divide-[#F0E8DF]">
                    {eventExpenses.map((expense) => (
                      <div
                        key={expense.id}
                        className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FCFAF7] transition-colors"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-[#2C2420]">
                              {expense.name}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#7A6B60]">
                            <span className="inline-flex items-center gap-1 font-medium text-[#8C6221]">
                              <User className="w-3 h-3 text-[#B2503A]" />
                              Paid by: {expense.paidBy}
                            </span>
                            {expense.date && (
                              <span className="text-[#A39284]">
                                • {expense.date}
                              </span>
                            )}
                            {expense.comment && (
                              <span className="text-[#685A50] bg-[#F7F2EA] px-2 py-0.5 rounded italic">
                                "{expense.comment}"
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Amount & Delete */}
                        <div className="flex items-center justify-between sm:justify-end gap-3 self-end sm:self-center">
                          <span className="font-serif-heading text-base sm:text-lg font-bold text-[#8C6221]">
                            {formatIndianRupee(expense.amount)}
                          </span>

                          <button
                            id={`delete-expense-${expense.id}`}
                            onClick={() => onDeleteExpense(expense.id)}
                            className="p-1.5 rounded-lg text-[#A39284] hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete this expense"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. Spent by Person Section:
          Dropdown to select a person, shows their expenses grouped by event in a collapsible accordion, with their total spend at the bottom. */}
      <section
        id="spent-by-person-section"
        className="luxury-card rounded-3xl p-6 md:p-8 bg-gradient-to-br from-[#FFFFFF] to-[#FAF6F0]"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8D7C3] pb-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-[#B2503A] mb-1">
              <User className="w-3.5 h-3.5" />
              <span>Individual Family Contributions</span>
            </div>
            <h2 className="font-serif-heading text-2xl md:text-3xl font-bold text-[#2C2420]">
              Spent by Person
            </h2>
            <p className="text-xs sm:text-sm text-[#7A6B60]">
              Filter expenses paid by any family member, grouped into collapsible event categories
            </p>
          </div>

          {/* Select Person Dropdown */}
          <div className="min-w-[220px]">
            <label
              htmlFor="spent-by-person-select"
              className="block text-xs font-semibold uppercase tracking-wider text-[#7A6B60] mb-1"
            >
              Select Person:
            </label>
            <select
              id="spent-by-person-select"
              value={selectedPerson}
              onChange={(e) => setSelectedPerson(e.target.value)}
              className="w-full px-3.5 py-2 bg-white border border-[#D9C8B5] rounded-xl text-sm font-semibold text-[#2C2420] focus:outline-none focus:ring-2 focus:ring-[#B2503A]/40 shadow-sm"
            >
              {familyMembers.map((member) => (
                <option key={member.id} value={member.name}>
                  {member.name} ({member.relationRole})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Selected Person Summary Card */}
        <div className="bg-[#FAF0E6]/60 rounded-2xl p-4 border border-[#E8D7C3] flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-[#B2503A] text-white flex items-center justify-center font-serif-heading font-bold text-lg shadow-sm">
              {selectedPerson.charAt(0)}
            </div>
            <div>
              <h3 className="font-serif-heading text-lg font-bold text-[#2C2420]">
                {selectedPerson}
              </h3>
              <p className="text-xs text-[#7A6B60]">
                Logged {personExpenses.length} transactions across events
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[11px] uppercase tracking-wider text-[#8C7A6B] block">
              Cumulative Spend
            </span>
            <span className="text-xl font-bold font-serif-heading text-[#8C6221]">
              {formatIndianRupee(personTotalSpent)}
            </span>
          </div>
        </div>

        {/* Collapsible Accordion by Event */}
        {personExpenses.length === 0 ? (
          <div className="text-center py-8 text-sm text-[#8C7A6B] bg-white/60 rounded-2xl border border-dashed border-[#D9C8B5]">
            No expenses currently recorded as paid by <strong>{selectedPerson}</strong>.
          </div>
        ) : (
          <div className="space-y-3">
            {WEDDING_EVENTS.map((event) => {
              const items = personExpensesByEvent[event] || [];
              if (items.length === 0) return null;
              const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
              const isOpen = openPersonAccordions[event] !== false; // open by default

              return (
                <div
                  key={event}
                  id={`person-accordion-${event.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                  className="rounded-2xl border border-[#E8D7C3] bg-white overflow-hidden shadow-xs"
                >
                  <button
                    type="button"
                    onClick={() => togglePersonAccordion(event)}
                    className="w-full px-5 py-3.5 bg-[#FAF7F2] hover:bg-[#F5EFE6] transition-colors flex items-center justify-between text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-[#8C6221]" />
                      <span className="font-serif-heading font-semibold text-[#2C2420] text-base">
                        {event}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-white text-[#8C7A6B] border border-[#E0D5C9]">
                        {items.length} {items.length === 1 ? 'expense' : 'expenses'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-bold text-sm text-[#8C6221]">
                        {formatIndianRupee(subtotal)}
                      </span>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-[#8C7A6B]" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-[#8C7A6B]" />
                      )}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="divide-y divide-[#F2EAE1] px-5 py-2">
                      {items.map((exp) => (
                        <div
                          key={exp.id}
                          className="py-3 flex items-center justify-between text-xs sm:text-sm gap-2"
                        >
                          <div>
                            <span className="font-medium text-[#2C2420] block">
                              {exp.name}
                            </span>
                            {exp.comment && (
                              <span className="text-xs text-[#8C7A6B] italic">
                                Note: {exp.comment}
                              </span>
                            )}
                          </div>
                          <span className="font-semibold text-[#2C2420] whitespace-nowrap">
                            {formatIndianRupee(exp.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Total spend summary footer at bottom */}
        <div className="mt-6 pt-4 border-t border-[#E8D7C3] flex items-center justify-between bg-[#FAF0E6]/40 p-4 rounded-2xl">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#8C7A6B] block">
              Total Spend by {selectedPerson}
            </span>
            <span className="text-xs text-[#7A6B60]">
              Accounted in overall wedding expenses
            </span>
          </div>
          <span className="font-serif-heading text-2xl font-bold text-[#8C6221]">
            {formatIndianRupee(personTotalSpent)}
          </span>
        </div>
      </section>
    </div>
  );
};
