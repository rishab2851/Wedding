/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  WeddingSettings,
  WeddingEvent,
  WEDDING_EVENTS,
  Expense,
  Task,
  TaskStatus,
  HotelGuest,
  TravelGuest,
  FamilyMember,
} from './types';
import {
  INITIAL_SETTINGS,
  INITIAL_EVENT_BUDGETS,
  INITIAL_EXPENSES,
  INITIAL_TASKS,
  INITIAL_HOTEL_GUESTS,
  INITIAL_TRAVEL_GUESTS,
  INITIAL_FAMILY_MEMBERS,
} from './data/initialData';
import { BudgetTracker } from './components/BudgetTracker';
import { TaskManager } from './components/TaskManager';
import { GuestLogisticsManager } from './components/GuestLogisticsManager';
import { SettingsManager } from './components/SettingsManager';
import { BottomNavigation, ActiveTab } from './components/BottomNavigation';
import {
  Sparkles,
  Heart,
  Calendar,
  Wallet,
  CheckSquare,
  Building2,
  Settings as SettingsIcon,
  User,
} from 'lucide-react';

const STORAGE_KEY_PREFIX = 'wedding_planner_v1_';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<ActiveTab>('budget');

  // App persistent states with safe localStorage initialization
  const [settings, setSettings] = useState<WeddingSettings>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}settings`);
      return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  });

  const [budgets, setBudgets] = useState<Record<WeddingEvent, number>>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}budgets`);
      return saved ? JSON.parse(saved) : INITIAL_EVENT_BUDGETS;
    } catch {
      return INITIAL_EVENT_BUDGETS;
    }
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}expenses`);
      return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
    } catch {
      return INITIAL_EXPENSES;
    }
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}tasks`);
      return saved ? JSON.parse(saved) : INITIAL_TASKS;
    } catch {
      return INITIAL_TASKS;
    }
  });

  const [hotelGuests, setHotelGuests] = useState<HotelGuest[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}hotel_guests`);
      return saved ? JSON.parse(saved) : INITIAL_HOTEL_GUESTS;
    } catch {
      return INITIAL_HOTEL_GUESTS;
    }
  });

  const [travelGuests, setTravelGuests] = useState<TravelGuest[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}travel_guests`);
      return saved ? JSON.parse(saved) : INITIAL_TRAVEL_GUESTS;
    } catch {
      return INITIAL_TRAVEL_GUESTS;
    }
  });

  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}family_members`);
      return saved ? JSON.parse(saved) : INITIAL_FAMILY_MEMBERS;
    } catch {
      return INITIAL_FAMILY_MEMBERS;
    }
  });

  const [activeMemberId, setActiveMemberId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}active_member_id`);
      return saved || INITIAL_FAMILY_MEMBERS[0]?.id || 'fam-1';
    } catch {
      return 'fam-1';
    }
  });

  // LocalStorage sync effects
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}settings`, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}budgets`, JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}expenses`, JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}tasks`, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}hotel_guests`, JSON.stringify(hotelGuests));
  }, [hotelGuests]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}travel_guests`, JSON.stringify(travelGuests));
  }, [travelGuests]);

  useEffect(() => {
    localStorage.setItem(
      `${STORAGE_KEY_PREFIX}family_members`,
      JSON.stringify(familyMembers)
    );
  }, [familyMembers]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}active_member_id`, activeMemberId);
  }, [activeMemberId]);

  // Handler: Add Expense
  const handleAddExpense = (expenseData: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...expenseData,
      id: `exp-${Date.now()}`,
    };
    setExpenses((prev) => [newExpense, ...prev]);
  };

  // Handler: Delete Expense
  const handleDeleteExpense = (expenseId: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== expenseId));
  };

  // Handler: Update Budgets
  const handleUpdateBudgets = (newBudgets: Record<WeddingEvent, number>) => {
    setBudgets(newBudgets);
  };

  // Handler: Add Task
  const handleAddTask = (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  // Handler: Update Task Status
  const handleUpdateTaskStatus = (taskId: string, newStatus: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );
  };

  // Handler: Delete Task
  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  // Handler: Reset All Data to Initial Demo State
  const handleResetData = () => {
    setSettings(INITIAL_SETTINGS);
    setBudgets(INITIAL_EVENT_BUDGETS);
    setExpenses(INITIAL_EXPENSES);
    setTasks(INITIAL_TASKS);
    setHotelGuests(INITIAL_HOTEL_GUESTS);
    setTravelGuests(INITIAL_TRAVEL_GUESTS);
    setFamilyMembers(INITIAL_FAMILY_MEMBERS);
    setActiveMemberId(INITIAL_FAMILY_MEMBERS[0]?.id || 'fam-1');
  };

  const pendingTasksCount = tasks.filter((t) => t.status !== 'Done').length;
  const currentMember = familyMembers.find((m) => m.id === activeMemberId) || familyMembers[0];

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#2C2420] flex flex-col antialiased selection:bg-[#F3D7CA] selection:text-[#5B231D]">
      {/* Top Luxury App Bar */}
      <header
        id="app-header"
        className="sticky top-0 z-30 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#E8D7C3]/80 px-4 sm:px-8 py-3.5 transition-all"
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Logo & Wedding Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#B2503A] to-[#8C6221] text-white flex items-center justify-center shadow-md shadow-[#B2503A]/20">
              <Heart className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif-heading font-extrabold tracking-[0.2em] text-sm uppercase text-[#2C2420]">
                  WEDDING PLANNER
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#FAF0E6] text-[#8C6221] border border-[#E0CFBD]">
                  Royal Suite
                </span>
              </div>
              <p className="text-[11px] text-[#8C7A6B] font-light">
                {settings.coupleNames} • {settings.weddingDate}
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-[#EFE9DF]/70 p-1 rounded-2xl border border-[#DFD3C3]">
            <button
              onClick={() => setActiveTab('budget')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'budget'
                  ? 'bg-white text-[#B2503A] shadow-xs'
                  : 'text-[#7A6B60] hover:text-[#2C2420]'
              }`}
            >
              <Wallet className="w-4 h-4" />
              <span>Budget Tracker</span>
            </button>

            <button
              onClick={() => setActiveTab('tasks')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'tasks'
                  ? 'bg-white text-[#B2503A] shadow-xs'
                  : 'text-[#7A6B60] hover:text-[#2C2420]'
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              <span>Task Manager</span>
              {pendingTasksCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#B2503A] text-white text-[9px] font-bold flex items-center justify-center ml-0.5">
                  {pendingTasksCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('guests')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'guests'
                  ? 'bg-white text-[#B2503A] shadow-xs'
                  : 'text-[#7A6B60] hover:text-[#2C2420]'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Guests & Travel (Excel)</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-white text-[#B2503A] shadow-xs'
                  : 'text-[#7A6B60] hover:text-[#2C2420]'
              }`}
            >
              <SettingsIcon className="w-4 h-4" />
              <span>Settings</span>
            </button>
          </nav>

          {/* Active Family User Badge */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('settings')}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-[#E0D5C9] hover:border-[#B2503A] transition-colors text-xs text-[#2C2420] shadow-xs"
              title="Switch Active Family Coordinator"
            >
              <div className="w-6 h-6 rounded-full bg-[#FAF0E6] text-[#8C6221] font-serif-heading font-bold text-xs flex items-center justify-center">
                {currentMember?.name.charAt(0) || 'U'}
              </div>
              <span className="hidden sm:inline font-medium truncate max-w-[120px]">
                {currentMember?.name}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 md:px-8 pt-4 pb-20">
        {activeTab === 'budget' && (
          <BudgetTracker
            settings={settings}
            budgets={budgets}
            expenses={expenses}
            familyMembers={familyMembers}
            onUpdateBudgets={handleUpdateBudgets}
            onAddExpense={handleAddExpense}
            onDeleteExpense={handleDeleteExpense}
            onOpenSettings={() => setActiveTab('settings')}
          />
        )}

        {activeTab === 'tasks' && (
          <TaskManager
            settings={settings}
            tasks={tasks}
            familyMembers={familyMembers}
            onAddTask={handleAddTask}
            onUpdateTaskStatus={handleUpdateTaskStatus}
            onDeleteTask={handleDeleteTask}
            onOpenSettings={() => setActiveTab('settings')}
            onNavigateToGuests={() => setActiveTab('guests')}
          />
        )}

        {activeTab === 'guests' && (
          <GuestLogisticsManager
            hotelGuests={hotelGuests}
            travelGuests={travelGuests}
            familyMembers={familyMembers}
            onUpdateHotelGuests={setHotelGuests}
            onUpdateTravelGuests={setTravelGuests}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsManager
            settings={settings}
            familyMembers={familyMembers}
            activeMemberId={activeMemberId}
            onUpdateSettings={setSettings}
            onUpdateFamilyMembers={setFamilyMembers}
            onSelectActiveMember={setActiveMemberId}
            onResetData={handleResetData}
          />
        )}
      </main>

      {/* Luxury Bottom Navigation Bar (Accessible on mobile & desktop) */}
      <BottomNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        pendingTasksCount={pendingTasksCount}
      />
    </div>
  );
}
