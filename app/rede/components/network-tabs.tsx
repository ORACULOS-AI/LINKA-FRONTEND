"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { NetworkSearch } from "./network-search"
import { NetworkFilter } from "./network-filter"
import { AsyncNetworkList } from "./async-network-list"
import { Users, Clock, UserCheck } from "lucide-react"
import type { UserBaseCreate } from "@/lib/types/userTypes"
import { memo } from "react"

interface NetworkTabsProps {
  searchQuery: string
  setSearchQuery: (value: string) => void
  roleFilter: string
  setRoleFilter: (value: string) => void
  setSelectedUser: (user: UserBaseCreate) => void
}

export const NetworkTabs = memo(function NetworkTabs({
  searchQuery,
  setSearchQuery,
  roleFilter,
  setRoleFilter,
  setSelectedUser,
}: NetworkTabsProps) {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="all" className="w-full">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-6">
          {/* Tabs */}
          <TabsList className="bg-white border border-purple-100 p-1 rounded-xl shadow-sm flex overflow-x-auto h-auto justify-start">
            <TabsTrigger
              value="all"
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-lg px-4 py-2 font-medium transition-colors duration-200 flex items-center gap-2"
            >
              <Users className="h-4 w-4" />
              Todos
            </TabsTrigger>
            <TabsTrigger
              value="connected"
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-lg px-4 py-2 font-medium transition-colors duration-200 flex items-center gap-2"
            >
              <UserCheck className="h-4 w-4" />
              Conectados
            </TabsTrigger>
            <TabsTrigger
              value="pending"
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-lg px-4 py-2 font-medium transition-colors duration-200 flex items-center gap-2"
            >
              <Clock className="h-4 w-4" />
              Pendentes
            </TabsTrigger>
          </TabsList>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="flex-1 w-full sm:w-auto lg:w-80">
              <NetworkSearch searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
            </div>
            <NetworkFilter roleFilter={roleFilter} setRoleFilter={setRoleFilter} />
          </div>
        </div>

        <TabsContent value="all" className="mt-0">
          <AsyncNetworkList
            searchQuery={searchQuery}
            roleFilter={roleFilter}
            setSelectedUser={setSelectedUser}
            displayMode="all"
          />
        </TabsContent>

        <TabsContent value="connected" className="mt-0">
          <AsyncNetworkList
            searchQuery={searchQuery}
            roleFilter={roleFilter}
            setSelectedUser={setSelectedUser}
            displayMode="connected"
          />
        </TabsContent>

        <TabsContent value="pending" className="mt-0">
          <AsyncNetworkList
            searchQuery={searchQuery}
            roleFilter={roleFilter}
            setSelectedUser={setSelectedUser}
            displayMode="pending"
          />
        </TabsContent>
      </Tabs>
    </div>
  )
})
