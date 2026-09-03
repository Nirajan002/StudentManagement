import { configureStore } from "@reduxjs/toolkit";

import { AuthApi } from "./api/AuthApi";
import { StudentApi } from "./api/StudentApi";
import { TeacherApi } from "./api/TeacherApi";

export const store = configureStore({
  reducer: {
    [AuthApi.reducerPath]: AuthApi.reducer,
    [StudentApi.reducerPath]: StudentApi.reducer,
    [TeacherApi.reducerPath]: TeacherApi.reducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(AuthApi.middleware)
      .concat(StudentApi.middleware)
      .concat(TeacherApi.middleware),
});