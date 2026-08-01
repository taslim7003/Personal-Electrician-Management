import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { DbService } from '../../database/dbService';
import { 
  Project, 
  Customer, 
  Employee, 
  Attendance, 
  DailyLog, 
  Material, 
  Expense, 
  Payment, 
  Setting,
  BeforeAfterItem
} from '../../database/types';

interface DbContextType {
  projects: Project[];
  customers: Customer[];
  employees: Employee[];
  attendance: Attendance[];
  dailyLogs: DailyLog[];
  materials: Material[];
  expenses: Expense[];
  payments: Payment[];
  beforeAfterItems: BeforeAfterItem[];
  settings: Setting | null;
  dbLoading: boolean;
  refreshData: () => Promise<void>;
  
  // Projects CRUD
  saveProject: (project: Project) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  
  // Customers CRUD
  saveCustomer: (customer: Customer) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  
  // Employees CRUD
  saveEmployee: (employee: Employee) => Promise<void>;
  deleteEmployee: (id: string) => Promise<void>;
  
  // Attendance CRUD
  saveAttendance: (attendance: Attendance) => Promise<void>;
  deleteAttendance: (id: string) => Promise<void>;
  
  // Daily Logs CRUD
  saveDailyLog: (log: DailyLog) => Promise<void>;
  deleteDailyLog: (id: string) => Promise<void>;
  
  // Materials CRUD
  saveMaterial: (material: Material) => Promise<void>;
  deleteMaterial: (id: string) => Promise<void>;
  
  // Expenses CRUD
  saveExpense: (expense: Expense) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  
  // Payments CRUD
  savePayment: (payment: Payment) => Promise<void>;
  deletePayment: (id: string) => Promise<void>;

  // Before & After CRUD
  saveBeforeAfterItem: (item: BeforeAfterItem) => Promise<void>;
  deleteBeforeAfterItem: (id: string) => Promise<void>;
  
  // Settings CRUD
  updateSettings: (settings: Setting) => Promise<void>;
  
  // Backup Utilities
  exportDb: () => Promise<string>;
  importDb: (jsonString: string) => Promise<void>;
}

const DbContext = createContext<DbContextType | undefined>(undefined);

export const DbProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, isDemoMode } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [beforeAfterItems, setBeforeAfterItems] = useState<BeforeAfterItem[]>([]);
  const [settings, setSettings] = useState<Setting | null>(null);
  const [dbLoading, setDbLoading] = useState(true);

  // Memoize dbService instance
  const getDbService = useCallback(() => {
    return new DbService(currentUser?.uid || 'demo', isDemoMode || !currentUser);
  }, [currentUser, isDemoMode]);

  const refreshData = useCallback(async () => {
    setDbLoading(true);
    try {
      const dbSvc = getDbService();
      
      const [
        projs,
        custs,
        emps,
        atts,
        logs,
        mats,
        exps,
        pays,
        bas,
        setts
      ] = await Promise.all([
        dbSvc.getProjects(),
        dbSvc.getCustomers(),
        dbSvc.getEmployees(),
        dbSvc.getAttendance(),
        dbSvc.getDailyLogs(),
        dbSvc.getMaterials(),
        dbSvc.getExpenses(),
        dbSvc.getPayments(),
        dbSvc.getBeforeAfterItems(),
        dbSvc.getSettings()
      ]);

      setProjects(projs);
      setCustomers(custs);
      setEmployees(emps);
      setAttendance(atts);
      setDailyLogs(logs);
      setMaterials(mats);
      setExpenses(exps);
      setPayments(pays);
      setBeforeAfterItems(bas);
      setSettings(setts);
    } catch (err) {
      console.error("Error fetching business data from DbService:", err);
    } finally {
      setDbLoading(false);
    }
  }, [getDbService]);

  // Load data initially and whenever login state or demo mode changes
  useEffect(() => {
    refreshData();
  }, [currentUser, isDemoMode, refreshData]);

  // Projects CRUD
  const saveProject = async (project: Project) => {
    const dbSvc = getDbService();
    const saved = await dbSvc.saveProject(project);
    setProjects(prev => {
      const idx = prev.findIndex(x => x.id === project.id);
      if (idx > -1) {
        const copy = [...prev];
        copy[idx] = saved;
        return copy;
      }
      return [...prev, saved];
    });
  };

  const deleteProject = async (id: string) => {
    const dbSvc = getDbService();
    await dbSvc.deleteProject(id);
    setProjects(prev => prev.filter(x => x.id !== id));
  };

  // Customers CRUD
  const saveCustomer = async (customer: Customer) => {
    const dbSvc = getDbService();
    const saved = await dbSvc.saveCustomer(customer);
    setCustomers(prev => {
      const idx = prev.findIndex(x => x.id === customer.id);
      if (idx > -1) {
        const copy = [...prev];
        copy[idx] = saved;
        return copy;
      }
      return [...prev, saved];
    });
  };

  const deleteCustomer = async (id: string) => {
    const dbSvc = getDbService();
    await dbSvc.deleteCustomer(id);
    setCustomers(prev => prev.filter(x => x.id !== id));
  };

  // Employees CRUD
  const saveEmployee = async (employee: Employee) => {
    const dbSvc = getDbService();
    const saved = await dbSvc.saveEmployee(employee);
    setEmployees(prev => {
      const idx = prev.findIndex(x => x.id === employee.id);
      if (idx > -1) {
        const copy = [...prev];
        copy[idx] = saved;
        return copy;
      }
      return [...prev, saved];
    });
  };

  const deleteEmployee = async (id: string) => {
    const dbSvc = getDbService();
    await dbSvc.deleteEmployee(id);
    setEmployees(prev => prev.filter(x => x.id !== id));
  };

  // Attendance CRUD
  const saveAttendance = async (att: Attendance) => {
    const dbSvc = getDbService();
    const saved = await dbSvc.saveAttendance(att);
    setAttendance(prev => {
      const idx = prev.findIndex(x => x.id === att.id);
      if (idx > -1) {
        const copy = [...prev];
        copy[idx] = saved;
        return copy;
      }
      return [...prev, saved];
    });
  };

  const deleteAttendance = async (id: string) => {
    const dbSvc = getDbService();
    await dbSvc.deleteAttendance(id);
    setAttendance(prev => prev.filter(x => x.id !== id));
  };

  // Daily Logs CRUD
  const saveDailyLog = async (log: DailyLog) => {
    const dbSvc = getDbService();
    const saved = await dbSvc.saveDailyLog(log);
    setDailyLogs(prev => {
      const idx = prev.findIndex(x => x.id === log.id);
      if (idx > -1) {
        const copy = [...prev];
        copy[idx] = saved;
        return copy;
      }
      return [...prev, saved];
    });
  };

  const deleteDailyLog = async (id: string) => {
    const dbSvc = getDbService();
    await dbSvc.deleteDailyLog(id);
    setDailyLogs(prev => prev.filter(x => x.id !== id));
  };

  // Materials CRUD
  const saveMaterial = async (material: Material) => {
    const dbSvc = getDbService();
    const saved = await dbSvc.saveMaterial(material);
    setMaterials(prev => {
      const idx = prev.findIndex(x => x.id === material.id);
      if (idx > -1) {
        const copy = [...prev];
        copy[idx] = saved;
        return copy;
      }
      return [...prev, saved];
    });
  };

  const deleteMaterial = async (id: string) => {
    const dbSvc = getDbService();
    await dbSvc.deleteMaterial(id);
    setMaterials(prev => prev.filter(x => x.id !== id));
  };

  // Expenses CRUD
  const saveExpense = async (expense: Expense) => {
    const dbSvc = getDbService();
    const saved = await dbSvc.saveExpense(expense);
    setExpenses(prev => {
      const idx = prev.findIndex(x => x.id === expense.id);
      if (idx > -1) {
        const copy = [...prev];
        copy[idx] = saved;
        return copy;
      }
      return [...prev, saved];
    });
  };

  const deleteExpense = async (id: string) => {
    const dbSvc = getDbService();
    await dbSvc.deleteExpense(id);
    setExpenses(prev => prev.filter(x => x.id !== id));
  };

  // Payments CRUD
  const savePayment = async (payment: Payment) => {
    const dbSvc = getDbService();
    const saved = await dbSvc.savePayment(payment);
    setPayments(prev => {
      const idx = prev.findIndex(x => x.id === payment.id);
      if (idx > -1) {
        const copy = [...prev];
        copy[idx] = saved;
        return copy;
      }
      return [...prev, saved];
    });
  };

  const deletePayment = async (id: string) => {
    const dbSvc = getDbService();
    await dbSvc.deletePayment(id);
    setPayments(prev => prev.filter(x => x.id !== id));
  };

  // Before & After CRUD
  const saveBeforeAfterItem = async (item: BeforeAfterItem) => {
    const dbSvc = getDbService();
    const saved = await dbSvc.saveBeforeAfterItem(item);
    setBeforeAfterItems(prev => {
      const idx = prev.findIndex(x => x.id === item.id);
      if (idx > -1) {
        const copy = [...prev];
        copy[idx] = saved;
        return copy;
      }
      return [...prev, saved];
    });
  };

  const deleteBeforeAfterItem = async (id: string) => {
    const dbSvc = getDbService();
    await dbSvc.deleteBeforeAfterItem(id);
    setBeforeAfterItems(prev => prev.filter(x => x.id !== id));
  };

  // Settings Update
  const updateSettings = async (setts: Setting) => {
    const dbSvc = getDbService();
    const saved = await dbSvc.saveSettings(setts);
    setSettings(saved);
  };

  // Backup Utilities
  const exportDb = async () => {
    const dbSvc = getDbService();
    return dbSvc.exportDatabase();
  };

  const importDb = async (jsonString: string) => {
    const dbSvc = getDbService();
    await dbSvc.importDatabase(jsonString);
    await refreshData();
  };

  return (
    <DbContext.Provider value={{
      projects,
      customers,
      employees,
      attendance,
      dailyLogs,
      materials,
      expenses,
      payments,
      beforeAfterItems,
      settings,
      dbLoading,
      refreshData,
      saveProject,
      deleteProject,
      saveCustomer,
      deleteCustomer,
      saveEmployee,
      deleteEmployee,
      saveAttendance,
      deleteAttendance,
      saveDailyLog,
      deleteDailyLog,
      saveMaterial,
      deleteMaterial,
      saveExpense,
      deleteExpense,
      savePayment,
      deletePayment,
      saveBeforeAfterItem,
      deleteBeforeAfterItem,
      updateSettings,
      exportDb,
      importDb
    }}>
      {children}
    </DbContext.Provider>
  );
};

export const useDb = () => {
  const context = useContext(DbContext);
  if (context === undefined) {
    throw new Error('useDb must be used within a DbProvider');
  }
  return context;
};
