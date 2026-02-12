import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface Classroom {
  id: string;
  name: string;
  [key: string]: any;
}

interface ClassroomInvitation {
  id: string;
  token: string;
  classroom_name?: string;
  classroom_id?: string;
  teacher_name?: string;
  created_at?: string;
  [key: string]: any;
}

interface ClassroomContextType {
  classrooms: Classroom[];
  hasClassroom: boolean;
  isLoading: boolean;
  invitations: ClassroomInvitation[];
  invitationCount: number;
  acceptInvitation: (token: string) => Promise<void>;
  dismissInvitation: (id: string) => void;
  refreshClassrooms: () => Promise<void>;
  refreshInvitations: () => Promise<void>;
}

const ClassroomContext = createContext<ClassroomContextType | undefined>(undefined);

export function ClassroomProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, role } = useAuth();
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [invitations, setInvitations] = useState<ClassroomInvitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchClassrooms = useCallback(async () => {
    if (!isAuthenticated || role !== "student") {
      setClassrooms([]);
      setIsLoading(false);
      return;
    }
    try {
      const data = await api.get<Classroom[]>("/api/classrooms");
      setClassrooms(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch classrooms:", error);
      setClassrooms([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, role]);

  const fetchInvitations = useCallback(async () => {
    if (!isAuthenticated || role !== "student") {
      setInvitations([]);
      return;
    }
    try {
      const data = await api.get<ClassroomInvitation[]>("/api/classrooms/invitations/mine");
      setInvitations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch invitations:", error);
      setInvitations([]);
    }
  }, [isAuthenticated, role]);

  useEffect(() => {
    fetchClassrooms();
    fetchInvitations();
  }, [fetchClassrooms, fetchInvitations]);

  const acceptInvitation = useCallback(async (token: string) => {
    await api.post("/api/classrooms/invitations/accept", { token });
    // Remove from local list
    setInvitations(prev => prev.filter(inv => inv.token !== token));
    // Refresh classrooms so restricted pages unlock
    await fetchClassrooms();
  }, [fetchClassrooms]);

  const dismissInvitation = useCallback((id: string) => {
    setInvitations(prev => prev.filter(inv => inv.id !== id));
  }, []);

  const value: ClassroomContextType = {
    classrooms,
    hasClassroom: classrooms.length > 0,
    isLoading,
    invitations,
    invitationCount: invitations.length,
    acceptInvitation,
    dismissInvitation,
    refreshClassrooms: fetchClassrooms,
    refreshInvitations: fetchInvitations,
  };

  return (
    <ClassroomContext.Provider value={value}>
      {children}
    </ClassroomContext.Provider>
  );
}

export function useClassroom() {
  const context = useContext(ClassroomContext);
  if (context === undefined) {
    throw new Error("useClassroom must be used within a ClassroomProvider");
  }
  return context;
}
