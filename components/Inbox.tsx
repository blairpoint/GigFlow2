import React, { useState } from 'react';
import { BookingRequest, BookingStatus, UserMode } from '../types';
import { Clock, CheckCircle, XCircle, AlertCircle, Calendar, MapPin, PenTool, Upload, Trash2 } from 'lucide-react';

interface InboxProps {
  bookings: BookingRequest[];
  userMode: UserMode;
  onSelectBooking: (bookingId: string) => void;
  onUpdateStatus: (bookingId: string, status: BookingStatus) => void;
  clientSignatureUrl?: string;
  onClientSignatureUpload?: (base64: string) => void;
}

export const Inbox: React.FC<InboxProps> = ({ 
  bookings, 
  userMode, 
  onSelectBooking, 
  onUpdateStatus,
  clientSignatureUrl,
  onClientSignatureUpload
}) => {
  const [showSignatureModal, setShowSignatureModal] = useState(false);

  const getStatusColor = (status: BookingStatus) => {
    switch(status) {
      case BookingStatus.PENDING: return 'text-yellow-400 bg-yellow-900/20 border-yellow-700/50';
      case BookingStatus.ACCEPTED: return 'text-green-400 bg-green-900/20 border-green-700/50';
      case BookingStatus.DECLINED: return 'text-red-400 bg-red-900/20 border-red-700/50';
      case BookingStatus.NEGOTIATING: return 'text-blue-400 bg-blue-900/20 border-blue-700/50';
      case BookingStatus.SIGNED: return 'text-purple-400 bg-purple-900/20 border-purple-700/50';
      default: return 'text-slate-400 bg-slate-900 border-slate-700';
    }
  };

  const getStatusIcon = (status: BookingStatus) => {
    switch(status) {
      case BookingStatus.PENDING: return <Clock size={16} />;
      case BookingStatus.ACCEPTED: return <CheckCircle size={16} />;
      case BookingStatus.DECLINED: return <XCircle size={16} />;
      case BookingStatus.NEGOTIATING: return <AlertCircle size={16} />;
      case BookingStatus.SIGNED: return <PenTool size={16} />;
      default: return null;
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onClientSignatureUpload) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onClientSignatureUpload(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const sortedBookings = [...bookings].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="max-w-4xl mx-auto p-6 animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
           <h1 className="text-3xl font-bold text-white mb-2">
             {userMode === UserMode.DJ ? 'Artist Inbox' : 'Booking Management'}
           </h1>
           <p className="text-slate-400">
             {userMode === UserMode.DJ 
               ? 'Manage incoming booking requests and negotiations.' 
               : 'Track the status of your offers and contracts.'}
           </p>
        </div>

        {userMode === UserMode.CLIENT && (
          <button 
            onClick={() => setShowSignatureModal(!showSignatureModal)}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 px-4 py-2 rounded-lg transition-colors"
          >
            <PenTool size={16} /> My Signature
          </button>
        )}
      </div>

      {/* Client Signature Modal Area (Inline for simplicity) */}
      {showSignatureModal && userMode === UserMode.CLIENT && (
        <div className="mb-8 bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-xl animate-fade-in">
           <div className="flex justify-between items-center mb-4">
             <h3 className="text-lg font-bold text-white">Your Digital Signature</h3>
             <button onClick={() => setShowSignatureModal(false)} className="text-slate-500 hover:text-white"><XCircle size={20}/></button>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
             <div className="text-sm text-slate-400">
               <p className="mb-2">Upload a scan of your signature. This will be available to apply to contracts when you are ready to sign.</p>
               <div className="relative overflow-hidden inline-block">
                 <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                   <Upload size={16} /> Upload Image
                 </button>
                 <input 
                   type="file" 
                   accept="image/*" 
                   onChange={handleFileChange}
                   className="absolute inset-0 opacity-0 cursor-pointer"
                 />
               </div>
             </div>

             <div className="bg-white rounded-lg p-4 min-h-[100px] flex items-center justify-center border-2 border-dashed border-slate-300">
               {clientSignatureUrl ? (
                 <img src={clientSignatureUrl} alt="Client Signature" className="max-h-16 object-contain" />
               ) : (
                 <span className="text-slate-400 text-xs italic">No signature uploaded yet</span>
               )}
             </div>
           </div>
        </div>
      )}

      {/* Booking List */}
      <div className="space-y-4">
        {sortedBookings.length === 0 ? (
          <div className="text-center py-12 bg-slate-800/50 rounded-xl border border-slate-700">
            <div className="bg-slate-700/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
               <Clock className="text-slate-500" size={32} />
            </div>
            <h3 className="text-lg font-medium text-white">No Bookings Found</h3>
            <p className="text-slate-500">
              {userMode === UserMode.DJ ? 'You have no incoming requests.' : 'You haven\'t made any offers yet.'}
            </p>
          </div>
        ) : (
          sortedBookings.map(booking => (
            <div 
              key={booking.id}
              className="bg-slate-800 hover:bg-slate-800/80 transition-colors border border-slate-700 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer"
              onClick={() => onSelectBooking(booking.id)}
            >
              <div className="flex-1">
                 <div className="flex items-center gap-3 mb-2">
                   <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${getStatusColor(booking.status)}`}>
                     {getStatusIcon(booking.status)}
                     {booking.status}
                   </span>
                   <span className="text-xs text-slate-500 font-mono">
                     ID: {booking.id.slice(0, 8)}
                   </span>
                   <span className="text-xs text-slate-500">
                     {new Date(booking.createdAt).toLocaleDateString()}
                   </span>
                 </div>
                 
                 <h3 className="text-lg font-bold text-white mb-1">
                   {userMode === UserMode.DJ ? booking.promoterName : 'Booking Request'}
                 </h3>
                 
                 <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={14} className="text-indigo-400" /> {booking.eventDate}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock size={14} className="text-indigo-400" /> {booking.startTime} ({booking.durationHours}h)
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin size={14} className="text-indigo-400" /> {booking.location}
                    </div>
                 </div>
              </div>

              <div className="flex items-center gap-3">
                 {/* Action Buttons for Artist */}
                 {userMode === UserMode.DJ && booking.status === BookingStatus.PENDING && (
                   <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                     <button 
                       onClick={() => onUpdateStatus(booking.id, BookingStatus.ACCEPTED)}
                       className="bg-green-600 hover:bg-green-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                     >
                       Accept
                     </button>
                     <button 
                       onClick={() => onUpdateStatus(booking.id, BookingStatus.DECLINED)}
                       className="bg-red-600/20 hover:bg-red-600/40 text-red-400 border border-red-600/30 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                     >
                       Decline
                     </button>
                   </div>
                 )}

                 {/* View Button */}
                 <button className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                   View Details
                 </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};