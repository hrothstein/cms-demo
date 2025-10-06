import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { apiClient } from '../services/api'

const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      isAuthenticated: false,
      isLoading: false,
      user: null,
      token: null,

      // Actions
      login: async (credentials) => {
        set({ isLoading: true })
        try {
          const response = await apiClient.post('/auth/login', credentials)
          const { data } = response.data
          
          set({
            isAuthenticated: true,
            user: {
              customerId: data.customerId,
              username: data.username
            },
            token: data.token,
            isLoading: false
          })

          // Set token in API client
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
          
          return { success: true }
        } catch (error) {
          set({ isLoading: false })
          return { 
            success: false, 
            error: error.response?.data?.error?.message || 'Login failed' 
          }
        }
      },

      logout: () => {
        set({
          isAuthenticated: false,
          user: null,
          token: null
        })
        
        // Remove token from API client
        delete apiClient.defaults.headers.common['Authorization']
        
        // Clear localStorage
        localStorage.removeItem('auth-storage')
      },

      checkAuth: () => {
        const state = get()
        if (state.token) {
          // Set token in API client
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${state.token}`
          set({ isAuthenticated: true })
        }
        set({ isLoading: false })
      },

      updateUser: (userData) => {
        set({ user: { ...get().user, ...userData } })
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        token: state.token
      })
    }
  )
)

export { useAuthStore }
