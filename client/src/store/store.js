import { configureStore } from '@reduxjs/toolkit'
import auth from './slices/authSlice'
import organizations from './slices/organizationSlice'

export const store = configureStore({ reducer: { auth, organizations } })
