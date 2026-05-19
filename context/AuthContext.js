"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const getSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        }
      } catch (error) {
        console.error("Error getting session:", error);
        toast.error("Error loading user session");
      } finally {
        setLoading(false);
      }
    };

    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
        }
      } catch (error) {
        console.error("Auth state change error:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (data) {
        setProfile(data);
      } else if (error?.code === "PGRST116") {
        await createProfile(userId);
      } else if (error) {
        console.error("Error fetching profile:", error);
      }
    } catch (error) {
      console.error("Error in fetchProfile:", error);
    }
  };

  const createProfile = async (userId) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      let userRole = "operator";
      if (
        user?.email &&
        (user.email.endsWith("@admin.com") || user.email.includes("admin"))
      ) {
        userRole = "admin";
      }

      const { data, error } = await supabase
        .from("profiles")
        .insert([
          {
            id: userId,
            email: user?.email,
            role: userRole,
          },
        ])
        .select()
        .single();

      if (data) {
        setProfile(data);
      } else if (error) {
        console.error("Error creating profile:", error);
      }
    } catch (error) {
      console.error("Error in createProfile:", error);
    }
  };

  const signUp = async (email, password) => {
    try {
      const { data: signInData } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInData?.user) {
        toast.error("User already exists. Please log in instead.");
        return { error: { message: "User already exists" }, shouldRedirectToLogin: true };
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });

      if (error) {
        if (error.message.includes("already registered") || error.message.includes("already exists")) {
          toast.error("User already exists. Please log in instead.");
          return { error, shouldRedirectToLogin: true };
        }
        toast.error(error.message);
        return { error };
      }

      if (data?.user) {
        let userRole = "operator";
        
        if (email.endsWith("@admin.com") || email.includes("admin")) {
          userRole = "admin";
        } else if (email.includes("district")) {
          userRole = "district_officer";
        } else if (email.includes("ngo")) {
          userRole = "ngo";
        }

        const { error: profileError } = await supabase
          .from("profiles")
          .insert([
            {
              id: data.user.id,
              email: email,
              role: userRole,
            },
          ]);

        if (profileError) {
          console.error("Error creating profile:", profileError);
        }
      }

      toast.success("Account created successfully! You can now sign in.");
      return { data };
    } catch (error) {
      console.error("Sign up error:", error);
      toast.error("Sign up failed. Please try again.");
      return { error };
    }
  };

  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
        return { error };
      }

      if (data?.user) {
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.user.id)
          .single();

        if (profileError) {
          console.error("Error fetching profile:", profileError);
          toast.error("Error loading user profile");
          return { error: profileError };
        }

        setProfile(profileData);
        toast.success("Signed in successfully!");
        
        return { data, profile: profileData };
      }

      return { data };
    } catch (error) {
      console.error("Sign in error:", error);
      toast.error("Sign in failed");
      return { error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error(error.message);
      } else {
        setUser(null);
        setProfile(null);
        toast.success("Signed out successfully!");
        setTimeout(() => {
          router.push("/");
        }, 100);
      }
      return { error };
    } catch (error) {
      toast.error("Sign out failed");
      return { error };
    }
  };

  const value = {
    user,
    profile,
    loading,
    mounted,
    signUp,
    signIn,
    signOut,
    isAdmin: profile?.role === "admin",
    isOperator: profile?.role === "operator",
    isDistrictOfficer: profile?.role === "district_officer",
    isNGO: profile?.role === "ngo",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
