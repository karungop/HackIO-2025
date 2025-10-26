'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { auth } from '../lib/firebase'
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth'

const AuthContext = createContext(undefined)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const signIn = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (error) {
      throw error
    }
  }

  const signUp = async (email, password, name) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      // Update the user's display name
      await updateProfile(userCredential.user, {
        displayName: name
      })
    } catch (error) {
      throw error
    }
  }

  const logout = async () => {
    try {
      setLoading(true)
      await signOut(auth)
      // The onAuthStateChanged listener will handle setting loading to false
    } catch (error) {
      setLoading(false)
      throw error
    }
  }

  const value = {
    user,
    loading,
    signIn,
    signUp,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
