"use client"
import { createContext, useContext, useState } from "react"
import { UserType } from "@/types/user";
interface AuthContextType {
    user: UserType | undefined;
    setUser: (user: UserType | undefined)=>void;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AuthContextProvider = ({children, initialValue}:{children: React.ReactNode, initialValue: UserType})=>{
    const [user, setUser] = useState<UserType | undefined>(initialValue);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

function useAuth(){
    const context = useContext(AuthContext);
    if(context == undefined){
        throw new Error("Use Auth must be used inside the Auth Provider");
    }
    return context;
}

export {AuthContextProvider, useAuth}