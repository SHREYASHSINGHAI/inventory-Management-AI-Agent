'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PackageSearch, TrendingDown, TrendingUp, Clock } from 'lucide-react';
import { InventoryItem } from '@/lib/inventory';

export default function InventoryDashboard({ refreshTrigger }: { refreshTrigger: number }) {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInventory();
  }, [refreshTrigger]);

  const fetchInventory = async () => {
    try {
      const res = await fetch('/api/inventory');
      const data = await res.json();
      setInventory(data);
    } catch (error) {
      console.error('Failed to fetch inventory', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col p-6 space-y-6 overflow-hidden">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <PackageSearch className="w-6 h-6 text-blue-400" />
            Live Inventory
          </h2>
          <p className="text-slate-400 text-sm mt-1">Real-time status of your stock</p>
        </div>
        <div className="glass px-4 py-2 rounded-full text-sm font-medium text-blue-300">
          {inventory.length} Items Total
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 pb-10">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
            <AnimatePresence>
              {inventory.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  className="glass p-5 rounded-2xl flex flex-col justify-between hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-semibold text-lg text-slate-100 truncate pr-2">{item.name}</h3>
                    <div className={`px-2 py-1 rounded-md text-xs font-bold ${item.quantity > 10 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                      {item.quantity > 10 ? <TrendingUp className="w-3 h-3 inline mr-1" /> : <TrendingDown className="w-3 h-3 inline mr-1" />}
                      {item.quantity} {item.unit}
                    </div>
                  </div>
                  <div className="flex items-center text-xs text-slate-500 mt-auto pt-4 border-t border-slate-700/50">
                    <Clock className="w-3 h-3 mr-1" />
                    Updated {new Date(item.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {inventory.length === 0 && (
              <div className="col-span-full text-center py-10 text-slate-500">
                No items in inventory. Ask the AI agent to add some!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
