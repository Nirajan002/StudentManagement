import { combineReducers, configureStore, type UnknownAction } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { AuthApi } from "./api/AuthApi";
import { GroupApi } from "./api/GroupApi";
import { StudentApi } from "./api/StudentApi";
import { TeacherApi } from "./api/TeacherApi";
import { DashboardApi } from "./api/DashboardApi";
import { GlobalNoticeApi } from "./api/GlobalNoticeApi";
import { ClassSectionApi } from "./api/ClassSectionApi";
import { AttendanceApi } from "./api/AttendanceApi";

const appReducer = combineReducers({
  [AuthApi.reducerPath]: AuthApi.reducer,
  [GroupApi.reducerPath]: GroupApi.reducer,
  [StudentApi.reducerPath]: StudentApi.reducer,
  [TeacherApi.reducerPath]: TeacherApi.reducer,
  [DashboardApi.reducerPath]: DashboardApi.reducer,
  [GlobalNoticeApi.reducerPath]: GlobalNoticeApi.reducer,
  [ClassSectionApi.reducerPath]: ClassSectionApi.reducer,
  [AttendanceApi.reducerPath]: AttendanceApi.reducer,
});

const rootReducer = (
  state: ReturnType<typeof appReducer> | undefined,
  action: UnknownAction,
) => {
  if (action.type === "auth/resetStore") {
    state = undefined;
  }
  return appReducer(state, action);
};

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(AuthApi.middleware)
      .concat(GroupApi.middleware)
      .concat(StudentApi.middleware)
      .concat(TeacherApi.middleware)
      .concat(DashboardApi.middleware)
      .concat(GlobalNoticeApi.middleware)
      .concat(ClassSectionApi.middleware)
      .concat(AttendanceApi.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof appReducer>;
export type AppDispatch = typeof store.dispatch;