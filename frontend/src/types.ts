export type UserRole = "admin" | "volunteer";

export type User = {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  skills: string[];
  location: {
    type: "Point";
    coordinates: [number, number];
  };
  address?: string;
  availability: boolean;
  rating: number;
  createdAt?: string;
};

export type TaskStatus = "open" | "in-progress" | "completed";
export type TaskPriority = "low" | "medium" | "high";

export type Task = {
  _id: string;
  title: string;
  description: string;
  requiredSkills: string[];
  location: {
    type: "Point";
    coordinates: [number, number];
  };
  address?: string;
  volunteersNeeded: number;
  assignedCount: number;
  status: TaskStatus;
  priority: TaskPriority;
  createdBy: string;
  distance?: number;
  createdAt: string;
  updatedAt: string;
};

export type AssignmentStatus = "assigned" | "accepted" | "rejected" | "completed";

export type Assignment = {
  _id: string;
  task: Task | string;
  volunteer: User | string;
  status: AssignmentStatus;
  aiReason: string;
  aiScore: number;
  createdAt: string;
  updatedAt: string;
};

export type AuthState = {
  user: User | null;
  token: string | null;
};

export type HelpRequestStatus = "pending" | "approved" | "converted" | "rejected" | "completed";
export type HelpRequestPriority = "low" | "medium" | "high" | "emergency";

export type HelpRequest = {
  _id: string;
  name: string;
  phone: string;
  description: string;
  location: {
    address: string;
    coordinates: [number, number];
  };
  volunteersNeeded: number;
  priority: HelpRequestPriority;
  status: HelpRequestStatus;
  linkedTask?: any;
  createdAt: string;
  updatedAt: string;
};
