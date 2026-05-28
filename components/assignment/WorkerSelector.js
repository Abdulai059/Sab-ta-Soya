"use client";

import { useState, useMemo } from "react";
import { User, ChevronDown, Search, X, Loader2 } from "lucide-react";
import { useWorkerList } from "@/hooks/useWorkerList";
import { useAssignment } from "@/hooks/useAssignment";
import { useAuth } from "@/context/AuthContext";
import { useHasPermission } from "@/hooks/usePermissions";
import { REPORTS } from "@/lib/permissions";

/**
 * WorkerSelector Component
 * Allows admins to assign reports to sanitation workers
 * 
 * @param {Object} props
 * @param {string} props.reportId - UUID of the report to assign
 * @param {string} props.currentAssignedTo - UUID of currently assigned worker (optional)
 * @param {Function} props.onAssignSuccess - Callback after successful assignment
 */
export default function WorkerSelector({ reportId, currentAssignedTo, onAssignSuccess }) {
  const { profile } = useAuth();
  const canAssign = useHasPermission(REPORTS.ASSIGN);
  
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: workers = [], isLoading: loadingWorkers } = useWorkerList();
  const { mutate: assignReport, isPending: isAssigning } = useAssignment();
  
  // Find currently assigned worker
  const currentWorker = useMemo(() => {
    return workers.find(w => w.id === currentAssignedTo);
  }, [workers, currentAssignedTo]);
  
  // Filter workers by search query
  const filteredWorkers = useMemo(() => {
    if (!searchQuery) return workers;
    const query = searchQuery.toLowerCase();
    return workers.filter(w => 
      w.full_name.toLowerCase().includes(query) ||
      w.email?.toLowerCase().includes(query)
    );
  }, [workers, searchQuery]);
  
  // Permission check
  if (!canAssign) {
    return null;
  }
  
  const handleAssign = (workerId) => {
    assignReport(
      {
        reportId,
        workerId,
        assignedBy: profile.id
      },
      {
        onSuccess: () => {
          setIsOpen(false);
          setSearchQuery("");
          onAssignSuccess?.();
        }
      }
    );
  };
  
  return (
    <div className="relative">
      {/* Desktop View (≥768px) */}
      <div className="hidden md:block">
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={isAssigning}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <User className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">
            {currentWorker?.full_name || 'Assign Worker'}
          </span>
          {isAssigning ? (
            <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          )}
        </button>
        
        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown */}
            <div className="absolute z-20 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg">
              {/* Search */}
              <div className="p-3 border-b border-gray-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search workers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
              
              {/* Worker List */}
              <div className="max-h-64 overflow-y-auto">
                {loadingWorkers ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                  </div>
                ) : filteredWorkers.length > 0 ? (
                  filteredWorkers.map(worker => (
                    <button
                      key={worker.id}
                      onClick={() => handleAssign(worker.id)}
                      disabled={isAssigning}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
                          {worker.avatar_url ? (
                            <img
                              src={worker.avatar_url}
                              alt={worker.full_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                              <span className="text-white font-bold text-sm">
                                {worker.full_name?.charAt(0).toUpperCase() ?? "?"}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900">{worker.full_name}</div>
                          <div className="text-sm text-gray-500">{worker.email}</div>
                          {worker.organization && (
                            <div className="text-xs text-gray-400 mt-1">{worker.organization}</div>
                          )}
                        </div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-8 text-center text-sm text-gray-500">
                    No workers found
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
      
      {/* Mobile View (<768px) */}
      <div className="md:hidden">
        <button
          onClick={() => setIsOpen(true)}
          disabled={isAssigning}
          className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">
              {currentWorker?.full_name || 'Assign Worker'}
            </span>
          </div>
          {isAssigning ? (
            <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          )}
        </button>
        
        {isOpen && (
          <div className="fixed inset-0 z-50 bg-white">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Select Worker</h2>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setSearchQuery("");
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            
            {/* Search */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search workers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
            
            {/* Worker List */}
            <div className="overflow-y-auto" style={{ height: 'calc(100vh - 140px)' }}>
              {loadingWorkers ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                </div>
              ) : filteredWorkers.length > 0 ? (
                filteredWorkers.map(worker => (
                  <button
                    key={worker.id}
                    onClick={() => handleAssign(worker.id)}
                    disabled={isAssigning}
                    className="w-full px-4 py-4 text-left hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border-b border-gray-100"
                    style={{ minHeight: '44px' }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden shrink-0">
                        {worker.avatar_url ? (
                          <img
                            src={worker.avatar_url}
                            alt={worker.full_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                            <span className="text-white font-bold text-lg">
                              {worker.full_name?.charAt(0).toUpperCase() ?? "?"}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900">{worker.full_name}</div>
                        <div className="text-sm text-gray-500 mt-1">{worker.email}</div>
                        {worker.organization && (
                          <div className="text-xs text-gray-400 mt-1">{worker.organization}</div>
                        )}
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="px-4 py-12 text-center text-sm text-gray-500">
                  No workers found
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
