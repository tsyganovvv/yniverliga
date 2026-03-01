export type AppRole = "employee" | "manager";

export interface SessionUser {
  id: string;
  username: string;
  role: string;
  department_id: string | null;
  is_active: boolean;
  created_at: string;
  fullname: string;
}

export interface AuthSession {
  token: string;
  user: SessionUser;
  appRole: AppRole;
}
