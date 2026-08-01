import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where,
  setDoc,
  getDoc
} from 'firebase/firestore';
import { db } from './firebase/config';
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
} from './types';

const DEFAULT_BEFORE_AFTER: BeforeAfterItem[] = [
  {
    id: 'ba1',
    title: 'Main Circuit Breaker Panel Upgrade',
    projectId: 'p2',
    customerName: 'Dr. Robert Chen',
    category: 'panel_upgrade',
    description: 'Replaced an old rusted fuse box with a neat 200 Amp breaker panel and surge protector.',
    beforeImageUrl: 'https://images.unsplash.com/photo-1558211583-d26f610c1eb1?auto=format&fit=crop&q=80&w=800',
    afterImageUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=800',
    beforeLabel: 'Old Fuse Box (Rusted / Unsafe)',
    afterLabel: '200A Modern Breaker Board',
    date: '2026-07-12',
    ownerId: 'demo',
    createdAt: '2026-07-12T10:00:00Z'
  },
  {
    id: 'ba2',
    title: 'Recessed LED Ceiling Lighting Fitout',
    projectId: 'p1',
    customerName: 'Apex Corp Solutions',
    category: 'lighting',
    description: 'Replaced outdated flickering fluorescent tubes with energy-efficient warm recessed LED panels.',
    beforeImageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=800',
    afterImageUrl: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&q=80&w=800',
    beforeLabel: 'Old Fluorescent Tubes',
    afterLabel: 'Modern Recessed LED Lighting',
    date: '2026-07-20',
    ownerId: 'demo',
    createdAt: '2026-07-20T14:30:00Z'
  }
];

// Default mock data to populate empty states
const DEFAULT_CUSTOMERS: Customer[] = [
  { id: 'c1', name: 'Apex Corp Solutions', phone: '555-0192', address: '102 Industrial Parkway, Sector 4', notes: 'Commercial client, billing contact: Sarah', ownerId: 'demo' },
  { id: 'c2', name: 'Dr. Robert Chen', phone: '555-0381', address: '482 Redwood Lane, Greenhills', notes: 'Residential client, prefers weekend visits', ownerId: 'demo' },
  { id: 'c3', name: 'Superstar Retail Mall', phone: '555-0722', address: 'Avenue Mall, Suite 40', notes: 'Store manager: Dave. Work out of hours only', ownerId: 'demo' }
];

const DEFAULT_PROJECTS: Project[] = [
  {
    id: 'p1',
    name: 'Apex Commercial HQ Lighting Installation',
    customerName: 'Apex Corp Solutions',
    customerPhone: '555-0192',
    customerAddress: '102 Industrial Parkway, Sector 4',
    workLocation: 'Floor 3, Block B',
    category: 'commercial',
    contractAmount: 18500,
    advanceReceived: 5000,
    status: 'running',
    priority: 'high',
    startDate: '2026-07-01',
    expectedCompletionDate: '2026-08-15',
    notes: 'Wiring 40 LED panels and setting up central control boards.',
    mediaUrls: ['https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=600'],
    ownerId: 'demo',
    createdAt: '2026-07-01T10:00:00Z',
    updatedAt: '2026-07-01T10:00:00Z'
  },
  {
    id: 'p2',
    name: 'Chen Residence Panel & EV Charger Upgrade',
    customerName: 'Dr. Robert Chen',
    customerPhone: '555-0381',
    customerAddress: '482 Redwood Lane, Greenhills',
    workLocation: 'Garage & Basement',
    category: 'residential',
    contractAmount: 4200,
    advanceReceived: 4200,
    status: 'completed',
    priority: 'medium',
    startDate: '2026-07-10',
    expectedCompletionDate: '2026-07-13',
    actualCompletionDate: '2026-07-12',
    notes: 'Upgraded old fuses to 200A panel and installed Level 2 EV charging socket.',
    mediaUrls: ['https://images.unsplash.com/photo-1558211583-d26f610c1eb1?auto=format&fit=crop&q=80&w=600'],
    ownerId: 'demo',
    createdAt: '2026-07-10T08:00:00Z',
    updatedAt: '2026-07-12T17:00:00Z'
  },
  {
    id: 'p3',
    name: 'Superstar Mall High Voltage Conduit Phase 2',
    customerName: 'Superstar Retail Mall',
    customerPhone: '555-0722',
    customerAddress: 'Avenue Mall, Suite 40',
    workLocation: 'Rear Service Corridor',
    category: 'commercial',
    contractAmount: 32000,
    advanceReceived: 10000,
    status: 'paused',
    priority: 'high',
    startDate: '2026-06-15',
    expectedCompletionDate: '2026-09-30',
    notes: 'On hold waiting for main transformer delivery from client.',
    mediaUrls: ['https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=600'],
    ownerId: 'demo',
    createdAt: '2026-06-15T09:00:00Z',
    updatedAt: '2026-06-15T09:00:00Z'
  }
];

const DEFAULT_EMPLOYEES: Employee[] = [
  { id: 'e1', name: 'James Carter', phone: '555-0144', dailyWage: 180, role: 'Senior Wireman', status: 'active', ownerId: 'demo' },
  { id: 'e2', name: 'Marcus Miller', phone: '555-0155', dailyWage: 120, role: 'Apprentice', status: 'active', ownerId: 'demo' },
  { id: 'e3', name: 'Robert Finch', phone: '555-0166', dailyWage: 150, role: 'Electrician', status: 'active', ownerId: 'demo' }
];

const DEFAULT_DAILY_LOGS: DailyLog[] = [
  {
    id: 'l1',
    projectId: 'p1',
    date: '2026-07-14',
    description: 'Laid down trunking conduits in Main Hallway. Hooked up main lines to substation B.',
    startTime: '08:00',
    endTime: '17:00',
    totalHours: 9,
    weather: 'Sunny & Hot',
    remarks: 'Ran into some concrete blocking near column C. Remedied using heavy impact drill.',
    ownerId: 'demo'
  },
  {
    id: 'l2',
    projectId: 'p1',
    date: '2026-07-15',
    description: 'Installed 12 LED office panels. Wired switch group G1.',
    startTime: '08:30',
    endTime: '16:30',
    totalHours: 8,
    weather: 'Overcast',
    remarks: 'James assisted. Work progressing faster than planned.',
    ownerId: 'demo'
  }
];

const DEFAULT_ATTENDANCE: Attendance[] = [
  { id: 'a1', employeeId: 'e1', date: '2026-07-14', status: 'present', workingHours: 8, overtimeHours: 1, advancePaid: 0, projectId: 'p1', ownerId: 'demo' },
  { id: 'a2', employeeId: 'e2', date: '2026-07-14', status: 'present', workingHours: 8, overtimeHours: 0, advancePaid: 0, projectId: 'p1', ownerId: 'demo' },
  { id: 'a3', employeeId: 'e1', date: '2026-07-15', status: 'present', workingHours: 8, overtimeHours: 0, advancePaid: 50, projectId: 'p1', ownerId: 'demo' },
  { id: 'a4', employeeId: 'e2', date: '2026-07-15', status: 'half_day', workingHours: 4, overtimeHours: 0, advancePaid: 0, projectId: 'p1', ownerId: 'demo' }
];

const DEFAULT_MATERIALS: Material[] = [
  { id: 'm1', name: 'FR Copper Wire 2.5sqmm', brand: 'Finolex', category: 'wire', quantity: 10, unit: 'Coils', rate: 45, gst: 18, totalCost: 531, supplier: 'Metro Electrical Wholesalers', purchaseDate: '2026-07-02', projectId: 'p1', ownerId: 'demo' },
  { id: 'm2', name: '16A 1-Way Switch Modular', brand: 'Anchor Roma', category: 'switch', quantity: 50, unit: 'Pcs', rate: 2, gst: 18, totalCost: 118, supplier: 'Metro Electrical Wholesalers', purchaseDate: '2026-07-02', projectId: 'p1', ownerId: 'demo' },
  { id: 'm3', name: '3-Phase Main Distribution Board 12-Way', brand: 'Schneider Electric', category: 'panel', quantity: 1, unit: 'Pc', rate: 350, gst: 18, totalCost: 413, supplier: 'Global Switchgears', purchaseDate: '2026-07-11', projectId: 'p2', ownerId: 'demo' }
];

const DEFAULT_EXPENSES: Expense[] = [
  { id: 'ex1', amount: 45, category: 'petrol', date: '2026-07-14', description: 'Fuel for transport van to Sector 4 site', projectId: 'p1', ownerId: 'demo' },
  { id: 'ex2', amount: 15, category: 'tea', date: '2026-07-14', description: 'Afternoon tea & refreshments for team', projectId: 'p1', ownerId: 'demo' },
  { id: 'ex3', amount: 531, category: 'material_purchase', date: '2026-07-02', description: 'Finolex 2.5sqmm wire bundle purchase', projectId: 'p1', ownerId: 'demo' },
  { id: 'ex4', amount: 80, category: 'tool_purchase', date: '2026-07-12', description: 'Heavy duty wire strippers purchased', projectId: 'p2', ownerId: 'demo' }
];

const DEFAULT_PAYMENTS: Payment[] = [
  { id: 'pay1', projectId: 'p1', date: '2026-07-01', amount: 5000, paymentMethod: 'bank', transactionId: 'TXN9182379123', ownerId: 'demo' },
  { id: 'pay2', projectId: 'p2', date: '2026-07-12', amount: 4200, paymentMethod: 'upi', transactionId: 'UPI-CHEN-EVUP', ownerId: 'demo' }
];

const DEFAULT_SETTINGS: Setting = {
  id: 'current_settings',
  businessName: 'SparkyPro Contracting',
  phone: '555-0100',
  email: 'owner@sparkypro.com',
  address: '77 Gridlines Court, Power City',
  currency: 'USD',
  theme: 'dark',
  ownerId: 'demo'
};

// Local storage helpers
const getLocal = <T>(key: string, def: T): T => {
  const data = localStorage.getItem(key);
  if (!data) {
    localStorage.setItem(key, JSON.stringify(def));
    return def;
  }
  try {
    return JSON.parse(data);
  } catch {
    return def;
  }
};

const saveLocal = (key: string, data: any) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export class DbService {
  private uid: string;
  private isDemo: boolean;

  constructor(uid: string, isDemo: boolean = false) {
    this.uid = uid;
    this.isDemo = isDemo;
  }

  private isCloud() {
    return !this.isDemo && this.uid && this.uid !== 'demo-admin-uid-12345';
  }

  // Generic implementation for read/write
  private async getCollection<T>(collName: string, defaultData: T[]): Promise<T[]> {
    if (this.isCloud()) {
      try {
        const q = query(collection(db, collName), where('ownerId', '==', this.uid));
        const snap = await getDocs(q);
        const list: any[] = [];
        snap.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });
        
        // If empty in Firestore but has local default, let's load default and save if empty
        if (list.length === 0) {
          const localSaved = getLocal<T[]>(`local_${collName}_${this.uid}`, defaultData);
          // If local has custom data, upload to cloud!
          const dataToSync = localSaved.map((item: any) => ({
            ...item,
            ownerId: this.uid,
            // Replace demo IDs if any
            id: item.id.startsWith('c') || item.id.startsWith('p') || item.id.startsWith('e') || item.id.startsWith('l') || item.id.startsWith('a') || item.id.startsWith('m') || item.id.startsWith('ex') || item.id.startsWith('pay') ? Math.random().toString(36).substr(2, 9) : item.id
          }));

          for (const item of dataToSync) {
            const { id, ...docData } = item;
            await setDoc(doc(db, collName, id), docData);
          }
          return dataToSync;
        }
        return list as T[];
      } catch (err) {
        console.warn(`Firestore read failed for ${collName}, falling back to localStorage:`, err);
        return getLocal<T[]>(`local_${collName}_${this.uid}`, defaultData);
      }
    } else {
      // Local demo mode
      return getLocal<T[]>(`local_${collName}_demo`, defaultData);
    }
  }

  private async saveItem<T extends { id: string }>(collName: string, item: T): Promise<T> {
    const dataWithOwner = { ...item, ownerId: this.isCloud() ? this.uid : 'demo' };
    
    if (this.isCloud()) {
      try {
        const { id, ...docData } = dataWithOwner;
        await setDoc(doc(db, collName, id), docData);
      } catch (err) {
        console.error(`Firestore save failed for ${collName}:`, err);
      }
      // Keep local in sync
      const list = getLocal<T[]>(`local_${collName}_${this.uid}`, []);
      const index = list.findIndex(x => x.id === item.id);
      if (index > -1) {
        list[index] = dataWithOwner;
      } else {
        list.push(dataWithOwner);
      }
      saveLocal(`local_${collName}_${this.uid}`, list);
    } else {
      const list = getLocal<T[]>(`local_${collName}_demo`, []);
      const index = list.findIndex(x => x.id === item.id);
      if (index > -1) {
        list[index] = dataWithOwner;
      } else {
        list.push(dataWithOwner);
      }
      saveLocal(`local_${collName}_demo`, list);
    }
    return dataWithOwner;
  }

  private async deleteItem(collName: string, id: string): Promise<void> {
    if (this.isCloud()) {
      try {
        await deleteDoc(doc(db, collName, id));
      } catch (err) {
        console.error(`Firestore delete failed for ${collName}:`, err);
      }
      const list = getLocal<any[]>(`local_${collName}_${this.uid}`, []);
      saveLocal(`local_${collName}_${this.uid}`, list.filter(x => x.id !== id));
    } else {
      const list = getLocal<any[]>(`local_${collName}_demo`, []);
      saveLocal(`local_${collName}_demo`, list.filter(x => x.id !== id));
    }
  }

  // --- PROJECTS ---
  async getProjects(): Promise<Project[]> {
    return this.getCollection<Project>('projects', DEFAULT_PROJECTS);
  }
  async saveProject(project: Project): Promise<Project> {
    return this.saveItem<Project>('projects', project);
  }
  async deleteProject(id: string): Promise<void> {
    return this.deleteItem('projects', id);
  }

  // --- CUSTOMERS ---
  async getCustomers(): Promise<Customer[]> {
    return this.getCollection<Customer>('customers', DEFAULT_CUSTOMERS);
  }
  async saveCustomer(customer: Customer): Promise<Customer> {
    return this.saveItem<Customer>('customers', customer);
  }
  async deleteCustomer(id: string): Promise<void> {
    return this.deleteItem('customers', id);
  }

  // --- EMPLOYEES ---
  async getEmployees(): Promise<Employee[]> {
    return this.getCollection<Employee>('employees', DEFAULT_EMPLOYEES);
  }
  async saveEmployee(employee: Employee): Promise<Employee> {
    return this.saveItem<Employee>('employees', employee);
  }
  async deleteEmployee(id: string): Promise<void> {
    return this.deleteItem('employees', id);
  }

  // --- ATTENDANCE ---
  async getAttendance(): Promise<Attendance[]> {
    return this.getCollection<Attendance>('attendance', DEFAULT_ATTENDANCE);
  }
  async saveAttendance(attendance: Attendance): Promise<Attendance> {
    return this.saveItem<Attendance>('attendance', attendance);
  }
  async deleteAttendance(id: string): Promise<void> {
    return this.deleteItem('attendance', id);
  }

  // --- DAILY LOGS ---
  async getDailyLogs(): Promise<DailyLog[]> {
    return this.getCollection<DailyLog>('dailyLogs', DEFAULT_DAILY_LOGS);
  }
  async saveDailyLog(log: DailyLog): Promise<DailyLog> {
    return this.saveItem<DailyLog>('dailyLogs', log);
  }
  async deleteDailyLog(id: string): Promise<void> {
    return this.deleteItem('dailyLogs', id);
  }

  // --- MATERIALS ---
  async getMaterials(): Promise<Material[]> {
    return this.getCollection<Material>('materials', DEFAULT_MATERIALS);
  }
  async saveMaterial(material: Material): Promise<Material> {
    return this.saveItem<Material>('materials', material);
  }
  async deleteMaterial(id: string): Promise<void> {
    return this.deleteItem('materials', id);
  }

  // --- EXPENSES ---
  async getExpenses(): Promise<Expense[]> {
    return this.getCollection<Expense>('expenses', DEFAULT_EXPENSES);
  }
  async saveExpense(expense: Expense): Promise<Expense> {
    return this.saveItem<Expense>('expenses', expense);
  }
  async deleteExpense(id: string): Promise<void> {
    return this.deleteItem('expenses', id);
  }

  // --- PAYMENTS ---
  async getPayments(): Promise<Payment[]> {
    return this.getCollection<Payment>('payments', DEFAULT_PAYMENTS);
  }
  async savePayment(payment: Payment): Promise<Payment> {
    return this.saveItem<Payment>('payments', payment);
  }
  async deletePayment(id: string): Promise<void> {
    return this.deleteItem('payments', id);
  }

  // --- BEFORE & AFTER PHOTOS ---
  async getBeforeAfterItems(): Promise<BeforeAfterItem[]> {
    return this.getCollection<BeforeAfterItem>('beforeAfterItems', DEFAULT_BEFORE_AFTER);
  }
  async saveBeforeAfterItem(item: BeforeAfterItem): Promise<BeforeAfterItem> {
    return this.saveItem<BeforeAfterItem>('beforeAfterItems', item);
  }
  async deleteBeforeAfterItem(id: string): Promise<void> {
    return this.deleteItem('beforeAfterItems', id);
  }

  // --- SETTINGS ---
  async getSettings(): Promise<Setting> {
    if (this.isCloud()) {
      try {
        const docRef = doc(db, 'settings', `settings_${this.uid}`);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          return { id: snap.id, ...snap.data() } as Setting;
        } else {
          // Save default settings
          const customSettings = { ...DEFAULT_SETTINGS, id: `settings_${this.uid}`, ownerId: this.uid };
          await setDoc(docRef, customSettings);
          return customSettings;
        }
      } catch (err) {
        console.warn("Firestore settings read failed, loading local:", err);
        return getLocal<Setting>(`local_settings_${this.uid}`, { ...DEFAULT_SETTINGS, id: `settings_${this.uid}`, ownerId: this.uid });
      }
    } else {
      return getLocal<Setting>('local_settings_demo', DEFAULT_SETTINGS);
    }
  }

  async saveSettings(settings: Setting): Promise<Setting> {
    const dataWithOwner = { ...settings, ownerId: this.isCloud() ? this.uid : 'demo' };
    if (this.isCloud()) {
      try {
        await setDoc(doc(db, 'settings', settings.id), dataWithOwner);
      } catch (err) {
        console.error("Firestore settings save failed:", err);
      }
      saveLocal(`local_settings_${this.uid}`, dataWithOwner);
    } else {
      saveLocal('local_settings_demo', dataWithOwner);
    }
    return dataWithOwner;
  }

  // Utility to export database as a JSON string
  async exportDatabase(): Promise<string> {
    const backup = {
      projects: await this.getProjects(),
      customers: await this.getCustomers(),
      employees: await this.getEmployees(),
      attendance: await this.getAttendance(),
      dailyLogs: await this.getDailyLogs(),
      materials: await this.getMaterials(),
      expenses: await this.getExpenses(),
      payments: await this.getPayments(),
      beforeAfterItems: await this.getBeforeAfterItems(),
      settings: await this.getSettings()
    };
    return JSON.stringify(backup, null, 2);
  }

  // Utility to import database from a backup
  async importDatabase(jsonString: string): Promise<void> {
    try {
      const data = JSON.parse(jsonString);
      const suffix = this.isCloud() ? this.uid : 'demo';
      
      if (data.projects) {
        const projs = data.projects.map((p: any) => ({ ...p, ownerId: suffix }));
        saveLocal(`local_projects_${suffix}`, projs);
        if (this.isCloud()) {
          for (const item of projs) {
            await this.saveItem('projects', item);
          }
        }
      }
      if (data.customers) {
        const custs = data.customers.map((c: any) => ({ ...c, ownerId: suffix }));
        saveLocal(`local_customers_${suffix}`, custs);
        if (this.isCloud()) {
          for (const item of custs) {
            await this.saveItem('customers', item);
          }
        }
      }
      if (data.employees) {
        const emps = data.employees.map((e: any) => ({ ...e, ownerId: suffix }));
        saveLocal(`local_employees_${suffix}`, emps);
        if (this.isCloud()) {
          for (const item of emps) {
            await this.saveItem('employees', item);
          }
        }
      }
      if (data.attendance) {
        const atts = data.attendance.map((a: any) => ({ ...a, ownerId: suffix }));
        saveLocal(`local_attendance_${suffix}`, atts);
        if (this.isCloud()) {
          for (const item of atts) {
            await this.saveItem('attendance', item);
          }
        }
      }
      if (data.dailyLogs) {
        const logs = data.dailyLogs.map((l: any) => ({ ...l, ownerId: suffix }));
        saveLocal(`local_dailyLogs_${suffix}`, logs);
        if (this.isCloud()) {
          for (const item of logs) {
            await this.saveItem('dailyLogs', item);
          }
        }
      }
      if (data.materials) {
        const mats = data.materials.map((m: any) => ({ ...m, ownerId: suffix }));
        saveLocal(`local_materials_${suffix}`, mats);
        if (this.isCloud()) {
          for (const item of mats) {
            await this.saveItem('materials', item);
          }
        }
      }
      if (data.expenses) {
        const exps = data.expenses.map((ex: any) => ({ ...ex, ownerId: suffix }));
        saveLocal(`local_expenses_${suffix}`, exps);
        if (this.isCloud()) {
          for (const item of exps) {
            await this.saveItem('expenses', item);
          }
        }
      }
      if (data.payments) {
        const pays = data.payments.map((p: any) => ({ ...p, ownerId: suffix }));
        saveLocal(`local_payments_${suffix}`, pays);
        if (this.isCloud()) {
          for (const item of pays) {
            await this.saveItem('payments', item);
          }
        }
      }
      if (data.beforeAfterItems) {
        const items = data.beforeAfterItems.map((b: any) => ({ ...b, ownerId: suffix }));
        saveLocal(`local_beforeAfterItems_${suffix}`, items);
        if (this.isCloud()) {
          for (const item of items) {
            await this.saveItem('beforeAfterItems', item);
          }
        }
      }
      if (data.settings) {
        const setts = { ...data.settings, ownerId: suffix };
        saveLocal(`local_settings_${suffix}`, setts);
        if (this.isCloud()) {
          await this.saveSettings(setts);
        }
      }
    } catch (err) {
      console.error("Failed to import database backup:", err);
      throw new Error("Invalid database backup file format.");
    }
  }
}
