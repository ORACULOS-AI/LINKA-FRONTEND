"use client"

import ProfilePage from "./components/profile"
import PrivateRoute from "@/components/private_route"
import { useSearchParams } from "next/navigation"

const Profile = () => {
  const searchParams = useSearchParams()
  const userId = searchParams?.get("id")
  const userType = searchParams?.get("type")

  return (
    <PrivateRoute>
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-violet-600 to-purple-700">
        <ProfilePage userId={userId} userType={userType} />
      </div>
    </PrivateRoute>
  )
}

export default Profile