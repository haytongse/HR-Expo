import { configureStore, combineReducers } from '@reduxjs/toolkit'
import { persistReducer, persistStore } from 'redux-persist'
import AsyncStorage from '@react-native-async-storage/async-storage'
import authReducer from './authSlice'
import attendanceReducer from './attendanceSlice'

const persistConfig = { key: 'root', storage: AsyncStorage, whitelist: ['auth'] }

const rootReducer = combineReducers({
  auth: authReducer,
  attendance: attendanceReducer,
})

export const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false }),
})

export const persistor = persistStore(store)
export type RootState = ReturnType<typeof rootReducer>
export type AppDispatch = typeof store.dispatch
