import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';

type DecodedToken = {
  sub: number;
  email: string;
  role: string;
  name: string;
  exp: number;
};

export function useAuthUser() {
  const [user, setUser] = useState<DecodedToken | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode<DecodedToken>(token);
        setUser(decoded);
      } catch {
        setUser(null);
      }
    }
  }, []);

  return user;
}
