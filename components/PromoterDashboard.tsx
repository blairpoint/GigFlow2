import React, { useState } from 'react';
import { Event, EventAsset, DJProfile } from '../types';
import { PROMOTER_CATALOG as CATALOG_ITEMS } from '../constants';
import { Plus, Trash2, Calendar, MapPin, DollarSign, PieChart, Briefcase, Music, Speaker, Users, Home } from 'lucide-react';
import { ResponsiveContainer, PieChart as RePieChart, Pie, Cell, Tooltip } from 'recharts';

interface PromoterDashboardProps {
  events: Event[];
  onAddEvent: (event: Event) => void;
  onUpdateEvent: (event: Event) => void;
  onBookArtist: (eventId: string) => void; // Navigates to ClientBooker
  djProfile: DJProfile;
}

export const PromoterDashboard: React.FC<PromoterDashboardProps> = ({ 
  events, 
  onAddEvent, 
  onUpdateEvent, 
  onBookArtist,
  djProfile 
}) => {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(events.length > 0 ? events[0].id : null);
  const [showNewEventForm, setShowNewEventForm] = useState(false);
  
  // New Event Form State
  const [newEventName, setNewEventName] = useState('');
  const [newEventBudget, setNewEventBudget] = useState('10000');
  const [newEventDate, setNewEventDate] = useState('');

  const selectedEvent = events.find(e => e.id === selectedEventId);

  const handleCreateEvent = () => {
    if (!newEventName || !newEventDate) return;
    const newEvent: Event = {
      id: Date.now().toString(),
      name: newEventName,
      date: newEventDate,
      totalBudget: Number(newEventBudget),
      assets: [],
      location: 'TBD'
    };
    onAddEvent(newEvent);
    setSelectedEventId(newEvent.id);
    setShowNewEventForm(false);
    setNewEventName('');
  };

  const addAssetToEvent = (assetTemplate: typeof CATALOG_ITEMS[0]) => {
    if (!selectedEvent) return;
    const newAsset: EventAsset = {
      ...assetTemplate,
      id: Date.now().toString(),
      bookingId: undefined, // Not an artist booking
    };
    const updatedEvent = {
      ...selectedEvent,
      assets: [...selectedEvent.assets, newAsset]
    };
    onUpdateEvent(updatedEvent);
  };

  const removeAsset = (assetId: string) => {
    if (!selectedEvent) return;
    const updatedEvent = {
      ...selectedEvent,
      assets: selectedEvent.assets.filter(a => a.id !== assetId)
    };
    onUpdateEvent(updatedEvent);
  };

  const totalSpend = selectedEvent?.assets.reduce((sum, a) => sum + (a.cost * a.quantity), 0) || 0;
  const remainingBudget = (selectedEvent?.totalBudget || 0) - totalSpend;
  const progressPercent = Math.min(100, (totalSpend / (selectedEvent?.totalBudget || 1)) * 100);

  // Chart Data
  const chartData = selectedEvent?.assets.reduce((acc, asset) => {
    const existing = acc.find(x => x.name === asset.type);
    if (existing) {
      existing.value += asset.cost * asset.quantity;
    } else {
      acc.push({ name: asset.type, value: asset.cost * asset.quantity });
    }
    return acc;
  }, [] as {name: string, value: number}[]) || [];

  const COLORS = ['#f59e0b', '#8b5cf6', '#10b981', '#ef4444', '#3b82f6'];

  return (
    <div className="max-w-7xl mx-auto p-4 animate-fade-in pb-20">
      
      {/* Header & Event Selector */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
            <Briefcase className="text-amber-500" /> Promoter Dashboard
          </h1>
          <p className="text-stone-400">Manage your events, budget, and talent bookings.</p>
        </div>
        <div className="flex gap-2">
           <select 
             value={selectedEventId || ''}
             onChange={(e) => setSelectedEventId(e.target.value)}
             className="bg-stone-800 border border-stone-700 text-white rounded-lg px-4 py-2 outline-none focus:border-amber-500"
           >
             {events.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
           </select>
           <button 
             onClick={() => setShowNewEventForm(true)}
             className="bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
           >
             <Plus size={18} /> New Event
           </button>
        </div>
      </div>

      {showNewEventForm && (
        <div className="bg-stone-800 p-6 rounded-xl border border-stone-700 mb-8 animate-slide-down">
          <h2 className="text-xl font-bold text-white mb-4">Create New Event</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
             <input type="text" placeholder="Event Name" value={newEventName} onChange={e => setNewEventName(e.target.value)} className="bg-stone-900 border border-stone-700 rounded-lg p-3 text-white outline-none" />
             <input type="number" placeholder="Total Budget" value={newEventBudget} onChange={e => setNewEventBudget(e.target.value)} className="bg-stone-900 border border-stone-700 rounded-lg p-3 text-white outline-none" />
             <input type="date" value={newEventDate} onChange={e => setNewEventDate(e.target.value)} className="bg-stone-900 border border-stone-700 rounded-lg p-3 text-white outline-none" />
          </div>
          <div className="flex justify-end gap-2">
             <button onClick={() => setShowNewEventForm(false)} className="text-stone-400 hover:text-white px-4 py-2">Cancel</button>
             <button onClick={handleCreateEvent} className="bg-amber-600 hover:bg-amber-500 text-white px-6 py-2 rounded-lg">Create Event</button>
          </div>
        </div>
      )}

      {!selectedEvent ? (
        <div className="text-center py-20 text-stone-500">
           Select or create an event to get started.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           
           {/* LEFT: Stats & Budget */}
           <div className="space-y-6">
              <div className="bg-stone-800 rounded-xl p-6 border border-stone-700 shadow-lg relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-full h-1 bg-stone-700">
                   <div className={`h-full transition-all duration-1000 ${remainingBudget < 0 ? 'bg-red-500' : 'bg-amber-500'}`} style={{ width: `${progressPercent}%` }}></div>
                 </div>
                 
                 <h2 className="text-stone-400 text-sm font-bold uppercase tracking-wider mb-6">Budget Overview</h2>
                 
                 <div className="flex flex-col gap-6">
                    <div>
                       <div className="text-3xl font-bold text-white mb-1">
                          {djProfile.currency} {remainingBudget.toLocaleString()}
                       </div>
                       <div className="text-sm text-stone-500">Remaining Budget</div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                       <div className="bg-stone-900 p-3 rounded-lg">
                          <div className="text-xs text-stone-500 mb-1">Total Budget</div>
                          <div className="font-mono text-stone-300">{djProfile.currency} {selectedEvent.totalBudget.toLocaleString()}</div>
                       </div>
                       <div className="bg-stone-900 p-3 rounded-lg">
                          <div className="text-xs text-stone-500 mb-1">Total Spend</div>
                          <div className="font-mono text-amber-500">{djProfile.currency} {totalSpend.toLocaleString()}</div>
                       </div>
                    </div>
                 </div>

                 <div className="h-48 mt-6">
                   <ResponsiveContainer width="100%" height="100%">
                     <RePieChart>
                       <Pie data={chartData} innerRadius={40} outerRadius={60} paddingAngle={5} dataKey="value">
                         {chartData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                       </Pie>
                       <Tooltip contentStyle={{ backgroundColor: '#1c1917', borderColor: '#44403c', color: '#fff' }} />
                     </RePieChart>
                   </ResponsiveContainer>
                 </div>
              </div>

              <div className="bg-stone-800 rounded-xl p-6 border border-stone-700">
                 <h2 className="text-white font-bold mb-4 flex items-center gap-2">
                   <Calendar size={18} className="text-stone-400" /> Event Details
                 </h2>
                 <div className="space-y-3 text-sm">
                    <div className="flex justify-between border-b border-stone-700 pb-2">
                       <span className="text-stone-500">Date</span>
                       <span className="text-white">{selectedEvent.date}</span>
                    </div>
                    <div className="flex justify-between border-b border-stone-700 pb-2">
                       <span className="text-stone-500">Location</span>
                       <span className="text-white">{selectedEvent.location}</span>
                    </div>
                    <div className="flex justify-between">
                       <span className="text-stone-500">Assets</span>
                       <span className="text-white">{selectedEvent.assets.length} items</span>
                    </div>
                 </div>
              </div>
           </div>

           {/* CENTER: Asset List */}
           <div className="lg:col-span-2 space-y-6">
              
              {/* Toolbar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                 <button 
                   onClick={() => onBookArtist(selectedEvent.id)}
                   className="bg-indigo-600 hover:bg-indigo-500 text-white p-4 rounded-xl border border-indigo-500/50 shadow-lg shadow-indigo-900/20 flex flex-col items-center justify-center gap-2 transition-transform hover:scale-105"
                 >
                    <Music size={24} />
                    <span className="font-bold text-sm">Book Artist</span>
                 </button>

                 <div className="col-span-1 sm:col-span-3 bg-stone-800 rounded-xl p-1 border border-stone-700 flex overflow-x-auto">
                    {CATALOG_ITEMS.map((item, idx) => (
                       <button 
                         key={idx}
                         onClick={() => addAssetToEvent(item)}
                         className="flex-shrink-0 flex flex-col items-center justify-center w-24 p-2 m-1 rounded-lg hover:bg-stone-700 transition-colors text-stone-400 hover:text-white"
                       >
                         {item.type === 'EQUIPMENT' && <Speaker size={18} />}
                         {item.type === 'STAFF' && <Users size={18} />}
                         {item.type === 'VENUE' && <Home size={18} />}
                         {item.type === 'OTHER' && <PieChart size={18} />}
                         <span className="text-[10px] text-center mt-1 truncate w-full">{item.name}</span>
                         <span className="text-[10px] text-amber-500 font-mono">${item.cost}</span>
                       </button>
                    ))}
                 </div>
              </div>

              {/* List */}
              <div className="bg-stone-800 rounded-xl border border-stone-700 overflow-hidden">
                 <div className="p-4 border-b border-stone-700 flex justify-between items-center">
                    <h2 className="font-bold text-white">Event Assets & Bookings</h2>
                    <span className="text-xs text-stone-500 uppercase tracking-wider">{selectedEvent.assets.length} Items</span>
                 </div>
                 
                 <div className="divide-y divide-stone-700/50">
                    {selectedEvent.assets.length === 0 ? (
                       <div className="p-8 text-center text-stone-500 italic">No assets added yet. Start adding equipment or book an artist.</div>
                    ) : (
                       selectedEvent.assets.map(asset => (
                          <div key={asset.id} className="p-4 flex items-center justify-between group hover:bg-stone-700/30 transition-colors">
                             <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center 
                                   ${asset.type === 'ARTIST' ? 'bg-indigo-900/30 text-indigo-400' : 
                                     asset.type === 'EQUIPMENT' ? 'bg-amber-900/30 text-amber-400' :
                                     asset.type === 'STAFF' ? 'bg-emerald-900/30 text-emerald-400' : 'bg-stone-700 text-stone-400'
                                   }`}>
                                   {asset.type === 'ARTIST' ? <Music size={20}/> : 
                                    asset.type === 'EQUIPMENT' ? <Speaker size={20}/> :
                                    asset.type === 'STAFF' ? <Users size={20}/> : <Home size={20}/>}
                                </div>
                                <div>
                                   <div className="font-bold text-white text-sm">{asset.name}</div>
                                   <div className="text-xs text-stone-500 uppercase tracking-wider flex items-center gap-2">
                                     {asset.type} 
                                     {asset.bookingId && <span className="text-indigo-400">• Linked Booking</span>}
                                   </div>
                                </div>
                             </div>
                             
                             <div className="flex items-center gap-6">
                                <div className="text-right">
                                   <div className="text-white font-mono">{djProfile.currency} {asset.cost.toLocaleString()}</div>
                                   {asset.quantity > 1 && <div className="text-xs text-stone-500">x{asset.quantity}</div>}
                                </div>
                                <button onClick={() => removeAsset(asset.id)} className="text-stone-600 hover:text-red-500 transition-colors">
                                   <Trash2 size={18} />
                                </button>
                             </div>
                          </div>
                       ))
                    )}
                 </div>
              </div>

           </div>
        </div>
      )}
    </div>
  );
};