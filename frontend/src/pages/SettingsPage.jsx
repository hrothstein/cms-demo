import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { User, Bell, Shield, CreditCard } from 'lucide-react'
import { customersAPI, notificationsAPI } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'

function SettingsPage() {
  const queryClient = useQueryClient()

  // Fetch user profile
  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => customersAPI.getProfile(),
  })

  // Fetch notification preferences
  const { data: preferencesData, isLoading: preferencesLoading } = useQuery({
    queryKey: ['notification-preferences'],
    queryFn: () => notificationsAPI.getPreferences(),
  })

  const profile = profileData?.data?.data
  const preferences = preferencesData?.data?.data

  // Profile form
  const profileForm = useForm({
    defaultValues: {
      email: profile?.email || '',
      phone: profile?.phone || '',
    }
  })

  // Notification preferences form
  const preferencesForm = useForm({
    defaultValues: {
      emailEnabled: preferences?.emailEnabled || false,
      emailAddress: preferences?.emailAddress || '',
      smsEnabled: preferences?.smsEnabled || false,
      smsNumber: preferences?.smsNumber || '',
      pushEnabled: preferences?.pushEnabled || false,
      transactionAlerts: preferences?.transactionAlerts || false,
      largeTransactionThreshold: preferences?.largeTransactionThreshold || 0,
      fraudAlerts: preferences?.fraudAlerts || false,
      cardStatusAlerts: preferences?.cardStatusAlerts || false,
      paymentDueAlerts: preferences?.paymentDueAlerts || false,
      quietHoursStart: preferences?.quietHoursStart || '',
      quietHoursEnd: preferences?.quietHoursEnd || '',
    }
  })

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data) => customersAPI.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['profile'])
    }
  })

  // Update preferences mutation
  const updatePreferencesMutation = useMutation({
    mutationFn: (data) => notificationsAPI.updatePreferences(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['notification-preferences'])
    }
  })

  const onProfileSubmit = (data) => {
    updateProfileMutation.mutate(data)
  }

  const onPreferencesSubmit = (data) => {
    updatePreferencesMutation.mutate(data)
  }

  if (profileLoading || preferencesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Settings */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center space-x-2">
              <User className="w-5 h-5 text-gray-500" />
              <h3 className="text-lg font-medium text-gray-900">Profile Settings</h3>
            </div>
          </div>
          <div className="card-body">
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
              <div>
                <label className="label">Email Address</label>
                <input
                  {...profileForm.register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  type="email"
                  className="input"
                />
                {profileForm.formState.errors.email && (
                  <p className="mt-1 text-sm text-danger-600">
                    {profileForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label className="label">Phone Number</label>
                <input
                  {...profileForm.register('phone')}
                  type="tel"
                  className="input"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div className="pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                  className="btn btn-primary"
                >
                  {updateProfileMutation.isPending ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center space-x-2">
              <Bell className="w-5 h-5 text-gray-500" />
              <h3 className="text-lg font-medium text-gray-900">Notification Preferences</h3>
            </div>
          </div>
          <div className="card-body">
            <form onSubmit={preferencesForm.handleSubmit(onPreferencesSubmit)} className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Email Notifications</span>
                  <input
                    {...preferencesForm.register('emailEnabled')}
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">SMS Notifications</span>
                  <input
                    {...preferencesForm.register('smsEnabled')}
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Push Notifications</span>
                  <input
                    {...preferencesForm.register('pushEnabled')}
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Transaction Alerts</span>
                  <input
                    {...preferencesForm.register('transactionAlerts')}
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Fraud Alerts</span>
                  <input
                    {...preferencesForm.register('fraudAlerts')}
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Card Status Alerts</span>
                  <input
                    {...preferencesForm.register('cardStatusAlerts')}
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                </div>
              </div>

              <div>
                <label className="label">Large Transaction Threshold</label>
                <input
                  {...preferencesForm.register('largeTransactionThreshold', {
                    valueAsNumber: true,
                    min: 0
                  })}
                  type="number"
                  step="0.01"
                  className="input"
                  placeholder="200.00"
                />
              </div>

              <div className="pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={updatePreferencesMutation.isPending}
                  className="btn btn-primary"
                >
                  {updatePreferencesMutation.isPending ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Saving...
                    </>
                  ) : (
                    'Save Preferences'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-gray-500" />
            <h3 className="text-lg font-medium text-gray-900">Security Settings</h3>
          </div>
        </div>
        <div className="card-body">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Change Password</h4>
                <p className="text-sm text-gray-500">Update your account password</p>
              </div>
              <button className="btn btn-secondary">Change Password</button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Two-Factor Authentication</h4>
                <p className="text-sm text-gray-500">Add an extra layer of security</p>
              </div>
              <button className="btn btn-secondary">Enable 2FA</button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Login History</h4>
                <p className="text-sm text-gray-500">View your recent login activity</p>
              </div>
              <button className="btn btn-secondary">View History</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
