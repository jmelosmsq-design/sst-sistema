import React, { createContext, useContext, useState, useEffect } from "react";
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut as fbSignOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile as fbUpdateProfile,
  updatePassword as fbUpdatePassword,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, googleProvider } from "../lib/firebase";
import { UserProfile } from "../types";

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (
    email: string,
    pass: string,
    nome: string,
    registro?: string,
    consultoria?: string,
    cargo?: string
  ) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  setUserPassword: (password: string) => Promise<void>;
  updateUserProfileData: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Sync profile from Firestore when user changes
  const fetchOrCreateUserProfile = async (firebaseUser: User, additionalData?: Partial<UserProfile>) => {
    try {
      const userRef = doc(db, "users", firebaseUser.uid);
      const snap = await getDoc(userRef);

      if (snap.exists()) {
        const profile = snap.data() as UserProfile;
        setUserProfile(profile);
      } else {
        const newProfile: UserProfile = {
          id: firebaseUser.uid,
          email: firebaseUser.email || "",
          nome: additionalData?.nome || firebaseUser.displayName || "Técnico SST",
          registro: additionalData?.registro || "",
          consultoria: additionalData?.consultoria || "Consultoria SST",
          cargo: additionalData?.cargo || "Técnico Vistoriador",
          telefone: additionalData?.telefone || "",
          role: "tecnico",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await setDoc(userRef, {
          ...newProfile,
          serverCreatedAt: serverTimestamp(),
        });
        setUserProfile(newProfile);
      }
    } catch (err) {
      console.warn("Aviso ao carregar perfil do Firestore:", err);
      // Fallback local profile
      setUserProfile({
        id: firebaseUser.uid,
        email: firebaseUser.email || "",
        nome: firebaseUser.displayName || "Técnico SST",
        role: "tecnico",
      });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setUser(fbUser);
      if (fbUser) {
        await fetchOrCreateUserProfile(fbUser);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithEmail = async (email: string, pass: string) => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
      await fetchOrCreateUserProfile(cred.user);
    } catch (error: any) {
      throw translateAuthError(error);
    }
  };

  const signUpWithEmail = async (
    email: string,
    pass: string,
    nome: string,
    registro?: string,
    consultoria?: string,
    cargo?: string
  ) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      if (nome) {
        await fbUpdateProfile(cred.user, { displayName: nome });
      }
      await fetchOrCreateUserProfile(cred.user, {
        nome,
        registro,
        consultoria,
        cargo: cargo || "Técnico Vistoriador",
      });
    } catch (error: any) {
      throw translateAuthError(error);
    }
  };

  const signInWithGoogle = async () => {
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      await fetchOrCreateUserProfile(cred.user);
    } catch (error: any) {
      throw translateAuthError(error);
    }
  };

  const signOut = async () => {
    try {
      await fbSignOut(auth);
      setUser(null);
      setUserProfile(null);
    } catch (error: any) {
      console.error("Erro ao sair:", error);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email.trim());
    } catch (error: any) {
      throw translateAuthError(error);
    }
  };

  const setUserPassword = async (password: string) => {
    if (!auth.currentUser) throw new Error("Usuário não está conectado.");
    try {
      await fbUpdatePassword(auth.currentUser, password);
    } catch (error: any) {
      throw translateAuthError(error);
    }
  };

  const updateUserProfileData = async (data: Partial<UserProfile>) => {
    if (!user) return;
    try {
      const userRef = doc(db, "users", user.uid);
      const updated = {
        ...userProfile,
        ...data,
        updatedAt: new Date().toISOString(),
      };
      await setDoc(userRef, updated, { merge: true });
      setUserProfile(updated as UserProfile);
    } catch (err) {
      console.error("Erro ao atualizar perfil:", err);
      throw new Error("Não foi possível salvar os dados do perfil.");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        signOut,
        resetPassword,
        setUserPassword,
        updateUserProfileData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

function translateAuthError(error: any): Error {
  const code = error?.code || "";
  const rawMsg = (error?.message || "").toLowerCase();
  let message = error?.message || "Ocorreu um erro na autenticação. Verifique os dados.";

  if (
    code === "auth/missing-initial-state" ||
    code === "auth/web-storage-unsupported" ||
    rawMsg.includes("missing initial state") ||
    rawMsg.includes("sessionstorage is inaccessible") ||
    rawMsg.includes("storage-partitioned") ||
    rawMsg.includes("sessionstorage")
  ) {
    message =
      "O navegador do celular bloqueou a conexão direta com o Google por restrições de privacidade/cookies de terceiros (Storage Partitioning). Para conectar com 100% de estabilidade no celular, utilize o login por E-mail e Senha abaixo (ou toque na aba 'Definir / Recuperar Senha' caso tenha entrado pelo Google no PC).";
  } else if (code === "auth/invalid-credential" || code === "auth/wrong-password" || code === "auth/user-not-found") {
    message = "E-mail ou senha incorretos. Se você se conectou pelo Google no computador, use a aba 'Definir / Recuperar Senha' para criar uma senha para seu e-mail.";
  } else if (code === "auth/email-already-in-use") {
    message = "Este e-mail já está cadastrado no sistema. Por favor, faça login com sua senha na aba 'Fazer Login' ou redefina sua senha.";
  } else if (code === "auth/weak-password") {
    message = "A senha deve conter no mínimo 6 caracteres.";
  } else if (code === "auth/invalid-email") {
    message = "Por favor, digite um endereço de e-mail válido.";
  } else if (code === "auth/popup-closed-by-user") {
    message = "A janela de login com o Google foi fechada antes da conclusão. Tente novamente ou use o login por e-mail e senha.";
  } else if (code === "auth/popup-blocked") {
    message = "O navegador do seu celular bloqueou a janela pop-up do Google. Recomendamos usar o login por E-mail e Senha abaixo.";
  } else if (code === "auth/cancelled-popup-request") {
    message = "Tentativa de login cancelada. Tente novamente.";
  } else if (code === "auth/unauthorized-domain") {
    message = "Domínio web em configuração. Você pode entrar e sincronizar instantaneamente usando seu E-mail e Senha abaixo!";
  } else if (code === "auth/network-request-failed") {
    message = "Falha de conexão com a internet. Verifique sua rede Wi-Fi ou dados móveis.";
  } else if (code === "auth/too-many-requests") {
    message = "Muitas tentativas sem sucesso. Aguarde alguns instantes e tente novamente.";
  }

  return new Error(message);
}
