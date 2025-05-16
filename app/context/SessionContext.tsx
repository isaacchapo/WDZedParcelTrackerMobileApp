import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { Session, User } from '@supabase/supabase-js';

type SessionContextType = {
  user: User | null;
  session: Session | null;
  setSession: (session: Session | null) => void;
};

const SessionContext = createContext<SessionContextType>({
  user: null,
  session: null,
  setSession: () => {},
});

export const useSession = () => useContext(SessionContext);

export const SessionProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setUser(data.session?.user ?? null);
    };

    fetchSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <SessionContext.Provider value={{ user, session, setSession }}>
      {children}
    </SessionContext.Provider>
  );
};
