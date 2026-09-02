import React from 'react'
import NavBar from "../components/NavBar";
import AdminView from "./AdminView";
import Users from "./Users"


export default function AdminDashboard() {
  return (
    <div>
        <NavBar />
        <AdminView />
        <Users />
    </div>
  )
}
