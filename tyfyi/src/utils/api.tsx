import { apiCall } from './supabase/client';

// Types
export interface User {
  id: string;
  email: string;
  companyName: string;
  logoUrl?: string;
  brandColor: string;
  careersPageUrl: string;
  departments: string[];
  introText: string;
  emailSettings?: {
    senderName: string;
    senderEmail: string;
    emailSubject: string;
  };
  atsProvider?: string;
  companyAtsId?: string;
}

export interface Subscriber {
  id: string;
  email: string;
  departments: string[];
  linkedInUrl?: string;
  companyId: string;
  signupDate: string;
  motivation?: string;
  currentLocation?: string;
  preferredLocation?: string;
  jobTitle?: string;
  talentPoolIds?: string[];
}

export interface TalentPool {
  id: string;
  title: string;
  departments: string[];
  companyId: string;
  createdDate: string;
  description?: string;
}

export interface CandidateData {
  email: string;
  departments: string[];
  linkedInUrl?: string;
  companyId: string;
}

export interface EnrichedCandidateData extends CandidateData {
  motivation?: string;
  currentLocation?: string;
  preferredLocation?: string;
  jobTitle?: string;
}

// Local storage keys
const STORAGE_KEYS = {
  users: 'tyfyi_users',
  subscribers: 'tyfyi_subscribers',
  talentPools: 'tyfyi_talent_pools',
  demoInitialized: 'tyfyi_demo_initialized'
};

// Local storage utilities
const storage = {
  get: (key: string) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },
  set: (key: string, value: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    }
  }
};

// Demo data
const getDemoData = () => ({
  subscribers: [
    {
      id: '1',
      email: 'sarah@example.com',
      departments: ['Engineering', 'Product'],
      linkedInUrl: 'https://linkedin.com/in/sarah-dev',
      companyId: 'demo-company',
      signupDate: '2024-01-15',
      motivation: 'Passionate about building scalable systems and leading technical teams.',
      currentLocation: 'San Francisco, CA',
      preferredLocation: 'San Francisco, CA',
      jobTitle: 'Senior Engineering Manager',
      talentPoolIds: ['1']
    },
    {
      id: '2',
      email: 'mike@example.com',
      departments: ['Marketing', 'Sales'],
      companyId: 'demo-company',
      signupDate: '2024-01-14',
      currentLocation: 'New York, NY',
      preferredLocation: 'Remote',
      jobTitle: 'Marketing Specialist',
      talentPoolIds: []
    },
    {
      id: '3',
      email: 'jane@example.com',
      departments: ['Engineering'],
      linkedInUrl: 'https://linkedin.com/in/jane-engineer',
      companyId: 'demo-company',
      signupDate: '2024-01-13',
      motivation: 'Looking to work on innovative ML projects that solve real-world problems.',
      currentLocation: 'Austin, TX',
      preferredLocation: 'Austin, TX',
      jobTitle: 'Machine Learning Engineer',
      talentPoolIds: ['1', '2']
    },
    {
      id: '4',
      email: 'alex@example.com',
      departments: ['Product'],
      linkedInUrl: 'https://linkedin.com/in/alex-pm',
      companyId: 'demo-company',
      signupDate: '2024-01-12',
      motivation: 'Product leader focused on user experience and data-driven decisions.',
      currentLocation: 'Seattle, WA',
      preferredLocation: 'Seattle, WA',
      jobTitle: 'Senior Product Manager',
      talentPoolIds: ['3']
    },
    {
      id: '5',
      email: 'emily@example.com',
      departments: ['Engineering'],
      companyId: 'demo-company',
      signupDate: '2024-01-11',
      currentLocation: 'Boston, MA',
      preferredLocation: 'Remote',
      jobTitle: 'Frontend Developer',
      talentPoolIds: []
    }
  ],
  talentPools: [
    {
      id: '1',
      title: 'Senior Engineers',
      departments: ['Engineering'],
      companyId: 'demo-company',
      createdDate: '2024-01-10',
      description: 'High-potential senior engineering candidates'
    },
    {
      id: '2',
      title: 'ML/AI Specialists',
      departments: ['Engineering', 'Product'],
      companyId: 'demo-company',
      createdDate: '2024-01-12',
      description: 'Candidates with machine learning and AI expertise'
    },
    {
      id: '3',
      title: 'Product Leaders',
      departments: ['Product'],
      companyId: 'demo-company',
      createdDate: '2024-01-08',
      description: 'Experienced product managers and leaders'
    }
  ]
});

// Initialize demo data if not exists
const initializeDemoData = () => {
  if (!storage.get(STORAGE_KEYS.demoInitialized)) {
    const demoData = getDemoData();
    storage.set(STORAGE_KEYS.subscribers, demoData.subscribers);
    storage.set(STORAGE_KEYS.talentPools, demoData.talentPools);
    storage.set(STORAGE_KEYS.demoInitialized, true);
  }
};

// Auth API functions
export const authAPI = {
  async register(userData: {
    email: string;
    password: string;
    companyName: string;
    brandColor?: string;
    departments?: string[];
    introText?: string;
    careersPageUrl?: string;
  }) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const users = storage.get(STORAGE_KEYS.users) || [];
    
    // Check if user already exists
    if (users.find((u: User) => u.email === userData.email)) {
      throw new Error('User already exists with this email');
    }
    
    const newUser: User = {
      id: `user-${Date.now()}`,
      email: userData.email,
      companyName: userData.companyName,
      brandColor: userData.brandColor || '#3B82F6',
      departments: userData.departments || ['Engineering', 'Product', 'Marketing', 'Sales'],
      introText: userData.introText || `Join our team at ${userData.companyName}! We're always looking for talented individuals.`,
      careersPageUrl: userData.careersPageUrl || '#'
    };
    
    users.push(newUser);
    storage.set(STORAGE_KEYS.users, users);
    
    return {
      message: 'User registered successfully',
      user: newUser,
      accessToken: 'demo-token'
    };
  },

  async login(credentials: { email: string; password: string }) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Demo credentials
    if (credentials.email === 'demo@company.com' && credentials.password === 'demo123') {
      const mockUser: User = {
        id: 'demo-company',
        email: 'demo@company.com',
        companyName: 'Tech Innovations Inc.',
        logoUrl: '',
        brandColor: '#3B82F6',
        careersPageUrl: 'https://techinnovations.com/careers',
        departments: ['Engineering', 'Product', 'Marketing', 'Sales'],
        introText: 'Join our team and help build the future of technology!'
      };
      
      return {
        message: 'Login successful',
        user: mockUser,
        accessToken: 'demo-token'
      };
    }
    
    const users = storage.get(STORAGE_KEYS.users) || [];
    const user = users.find((u: User) => u.email === credentials.email);
    
    if (!user) {
      throw new Error('Invalid credentials. Try demo@company.com / demo123');
    }
    
    return {
      message: 'Login successful',
      user,
      accessToken: 'demo-token'
    };
  },
};

// User API functions
export const userAPI = {
  async getUser(userId: string) {
    const users = storage.get(STORAGE_KEYS.users) || [];
    const user = users.find((u: User) => u.id === userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  },

  async updateUser(userId: string, updates: Partial<User>) {
    const users = storage.get(STORAGE_KEYS.users) || [];
    const userIndex = users.findIndex((u: User) => u.id === userId);
    
    if (userIndex === -1) {
      throw new Error('User not found');
    }
    
    users[userIndex] = { ...users[userIndex], ...updates };
    storage.set(STORAGE_KEYS.users, users);
    
    return users[userIndex];
  },
};

// Subscriber API functions
export const subscriberAPI = {
  async getSubscribers(companyId: string): Promise<Subscriber[]> {
    const subscribers = storage.get(STORAGE_KEYS.subscribers) || [];
    return subscribers.filter((sub: Subscriber) => 
      sub.companyId === companyId || sub.companyId === 'demo-company'
    );
  },

  async createSubscriber(subscriberData: EnrichedCandidateData): Promise<Subscriber> {
    const subscribers = storage.get(STORAGE_KEYS.subscribers) || [];
    
    const newSubscriber: Subscriber = {
      id: `subscriber-${Date.now()}`,
      ...subscriberData,
      signupDate: new Date().toISOString().split('T')[0],
      talentPoolIds: subscriberData.talentPoolIds || []
    };
    
    subscribers.push(newSubscriber);
    storage.set(STORAGE_KEYS.subscribers, subscribers);
    
    return newSubscriber;
  },

  async updateSubscriber(subscriberId: string, updates: Partial<Subscriber>): Promise<Subscriber> {
    const subscribers = storage.get(STORAGE_KEYS.subscribers) || [];
    const subscriberIndex = subscribers.findIndex((sub: Subscriber) => sub.id === subscriberId);
    
    if (subscriberIndex === -1) {
      throw new Error('Subscriber not found');
    }
    
    subscribers[subscriberIndex] = { ...subscribers[subscriberIndex], ...updates };
    storage.set(STORAGE_KEYS.subscribers, subscribers);
    
    return subscribers[subscriberIndex];
  },

  async deleteSubscriber(subscriberId: string): Promise<void> {
    const subscribers = storage.get(STORAGE_KEYS.subscribers) || [];
    const filteredSubscribers = subscribers.filter((sub: Subscriber) => sub.id !== subscriberId);
    storage.set(STORAGE_KEYS.subscribers, filteredSubscribers);
  },
};

// Talent Pool API functions
export const talentPoolAPI = {
  async getTalentPools(companyId: string): Promise<TalentPool[]> {
    const talentPools = storage.get(STORAGE_KEYS.talentPools) || [];
    return talentPools.filter((pool: TalentPool) => 
      pool.companyId === companyId || pool.companyId === 'demo-company'
    );
  },

  async createTalentPool(talentPoolData: Omit<TalentPool, 'id' | 'createdDate'>): Promise<TalentPool> {
    const talentPools = storage.get(STORAGE_KEYS.talentPools) || [];
    
    const newTalentPool: TalentPool = {
      id: `pool-${Date.now()}`,
      ...talentPoolData,
      createdDate: new Date().toISOString().split('T')[0]
    };
    
    talentPools.push(newTalentPool);
    storage.set(STORAGE_KEYS.talentPools, talentPools);
    
    return newTalentPool;
  },

  async updateTalentPool(talentPoolId: string, updates: Partial<TalentPool>): Promise<TalentPool> {
    const talentPools = storage.get(STORAGE_KEYS.talentPools) || [];
    const poolIndex = talentPools.findIndex((pool: TalentPool) => pool.id === talentPoolId);
    
    if (poolIndex === -1) {
      throw new Error('Talent pool not found');
    }
    
    talentPools[poolIndex] = { ...talentPools[poolIndex], ...updates };
    storage.set(STORAGE_KEYS.talentPools, talentPools);
    
    return talentPools[poolIndex];
  },

  async deleteTalentPool(talentPoolId: string): Promise<void> {
    const talentPools = storage.get(STORAGE_KEYS.talentPools) || [];
    const filteredPools = talentPools.filter((pool: TalentPool) => pool.id !== talentPoolId);
    storage.set(STORAGE_KEYS.talentPools, filteredPools);
    
    // Remove talent pool from subscribers
    const subscribers = storage.get(STORAGE_KEYS.subscribers) || [];
    const updatedSubscribers = subscribers.map((sub: Subscriber) => ({
      ...sub,
      talentPoolIds: sub.talentPoolIds?.filter(id => id !== talentPoolId) || []
    }));
    storage.set(STORAGE_KEYS.subscribers, updatedSubscribers);
  },
};

// Demo data initialization
export const demoAPI = {
  async initializeDemoData() {
    initializeDemoData();
    return { message: 'Demo data initialized successfully' };
  },
};