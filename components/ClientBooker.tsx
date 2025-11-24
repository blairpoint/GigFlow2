import React, { useState } from 'react';
import { DJProfile, OfferDetails, UserMode } from '../types';
import { Calendar, Clock, MapPin, DollarSign, CheckCircle, AlertCircle, Wine, Coffee, Car, Hotel, ExternalLink, CalendarCheck, CalendarX, AlertTriangle, Music, Package, Settings, Send, User } from 'lucide-react';

interface ClientBookerProps {
  profile: DJProfile;
  onSubmitOffer: (offer: OfferDetails) => void;
  currentUserMode: UserMode;
}

export const ClientBooker: React.FC<ClientBookerProps> = ({ profile, onSubmitOffer, currentUserMode }) => {
  const [step, setStep] = useState<'PROFILE' | 'FORM'>('PROFILE');
  
  // Pre-fill data for Promoter
  const isPromoter = currentUserMode === UserMode.PROMOTER;
  
  const [offer, setOffer] = useState<OfferDetails>({
    promoterName: isPromoter ? 'Premier Events Agency' : '',
    promoterEmail: isPromoter ? 'bookings@premierevents.com' : '',
    eventDate: '',
    startTime: '22:00',
    durationHours: 2,
    location: '',
    useStandardRate: true,
    counterOfferAmount: profile.hourlyRate,
    counterOfferType: 'FLAT',
    providesTransport: false,
    providesAccommodation: false,
    providesFood: false,
    providesDrinks: false,
    additionalNotes: '',
    selectedExtras: []
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    setOffer(prev => ({
      ...prev,
      [name]: val
    }));
  };

  const toggleExtra = (id: string) => {
    setOffer(prev => {
      const isSelected = prev.selectedExtras.includes(id);
      return {
        ...prev,
        selectedExtras: isSelected 
          ? prev.selectedExtras.filter(eid => eid !== id)
          : [...prev.selectedExtras, id]
      };
    });
  };

  const calculateExtrasTotal = () => {
    return profile.extras
      .filter(e => offer.selectedExtras.includes(e.id))
      .reduce((sum, item) => sum + item.price, 0);
  };

  const calculateTotal = () => {
    let base = 0;
    if (offer.useStandardRate) {
      base = profile.hourlyRate * Number(offer.durationHours);
    } else {
      base = Number(offer.counterOfferAmount);
    }
    return base + calculateExtrasTotal();
  };

  const schedule = profile.schedule || [];
  const pastGigs = schedule.filter(g => g.type === 'PAST').sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const futureGigs = schedule.filter(g => g.type !== 'PAST').sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Helper to check if any specific tech req is enabled
  const techReqs = profile.techRequirements;
  
  if (step === 'PROFILE') {
    return (
      <div className="max-w-6xl mx-auto animate-fade-in pb-20">
        {/* Hero Profile Header */}
        <div className="relative h-64 rounded-xl overflow-hidden mb-8 shadow-2xl mx-4">
          <img 
            src="https://picsum.photos/1200/400" 
            alt="Cover" 
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
          <div className="absolute bottom-0 left-0 p-8 w-full">
             <h1 className="text-5xl font-bold text-white mb-2 tracking-tight">{profile.name}</h1>
             <div className="flex flex-wrap gap-4 text-sm font-medium text-slate-300 items-center">
               <span className="bg-indigo-600/20 text-indigo-300 px-3 py-1 rounded-full border border-indigo-500/30">
                 {profile.currency} {profile.hourlyRate}/hr
               </span>
               {profile.genres && profile.genres.map(g => (
                 <span key={g.id} className="bg-slate-700/50 px-3 py-1 rounded-full border border-slate-600">
                   {g.name}
                 </span>
               ))}
               {(!profile.genres || profile.genres.length === 0) && (
                 <span className="bg-slate-700/50 px-3 py-1 rounded-full border border-slate-600">
                   Open Format
                 </span>
               )}
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-4">
          <div className="lg:col-span-2 space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">About</h2>
              <p className="text-slate-300 leading-relaxed whitespace-pre-line">{profile.bio}</p>
            </section>
            
            <section>
               <h2 className="text-2xl font-bold text-white mb-4">Music & Genres</h2>
               {profile.genres && profile.genres.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {profile.genres.map(genre => (
                      <div key={genre.id} className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                          <Music size={18} className="text-pink-400"/> {genre.name}
                        </h3>
                        {genre.links.length > 0 ? (
                          <ul className="space-y-2">
                             {genre.links.map((link, i) => (
                               <li key={i}>
                                  <a href={link} target="_blank" rel="noreferrer" className="text-sm text-indigo-300 hover:text-white flex items-center gap-2 truncate hover:underline">
                                     <ExternalLink size={14} /> {link}
                                  </a>
                               </li>
                             ))}
                          </ul>
                        ) : (
                          <p className="text-xs text-slate-500">No mix links listed.</p>
                        )}
                      </div>
                    ))}
                  </div>
               ) : (
                 <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 text-center text-slate-400">
                    <a href={profile.soundcloudUrl} target="_blank" rel="noreferrer" className="hover:text-indigo-400 underline">
                      Listen to Latest Mix on SoundCloud
                    </a>
                 </div>
               )}
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Past Gigs & References</h2>
              <div className="grid gap-3">
                {pastGigs.length > 0 ? pastGigs.map(gig => (
                  <div key={gig.id} className="bg-slate-800/50 border border-slate-700 p-4 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                       <div className="text-white font-medium">{gig.eventName}</div>
                       <div className="text-slate-500 text-sm">{gig.date}</div>
                    </div>
                    {gig.link && (
                      <a href={gig.link} target="_blank" rel="noreferrer" className="text-sm text-indigo-400 flex items-center gap-1 hover:underline">
                         <ExternalLink size={14} /> Listen to Set
                      </a>
                    )}
                  </div>
                )) : (
                  <p className="text-slate-500 italic">No past gigs listed.</p>
                )}
              </div>
            </section>
          </div>

          <div className="lg:col-span-1 space-y-6">
            
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 sticky top-6">
               <button 
                  onClick={() => setStep('FORM')}
                  className="w-full mb-8 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-[1.02] shadow-lg shadow-indigo-500/20"
                >
                   Start Offer
               </button>

               <h3 className="text-lg font-bold text-white mb-4">Upcoming Schedule</h3>
               <div className="space-y-3 mb-8">
                  {futureGigs.length > 0 ? futureGigs.map(gig => (
                    <div key={gig.id} className="flex items-start gap-3 text-sm pb-3 border-b border-slate-700/50 last:border-0">
                       {gig.type === 'AVAILABLE' ? (
                         <CalendarCheck size={18} className="text-green-500 mt-0.5 shrink-0" />
                       ) : (
                         <CalendarX size={18} className="text-slate-500 mt-0.5 shrink-0" />
                       )}
                       <div>
                         <div className={`font-medium ${gig.type === 'AVAILABLE' ? 'text-green-400' : 'text-slate-300'}`}>
                           {gig.type === 'AVAILABLE' ? 'Available' : 'Booked'}
                         </div>
                         <div className="text-slate-500 text-xs">{gig.date}</div>
                         {gig.type !== 'AVAILABLE' && <div className="text-slate-400">{gig.eventName}</div>}
                       </div>
                    </div>
                  )) : (
                    <p className="text-slate-500 text-sm">No upcoming schedule listed.</p>
                  )}
               </div>

               <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                 <Settings size={20} className="text-blue-400" /> Technical Rider
               </h3>
               
               <div className="space-y-1 bg-slate-900/50 rounded-lg p-3 border border-slate-700/50">
                  {/* Specific Requirements first */}
                  {techReqs.serato?.enabled && (
                    <div className="py-2 border-b border-slate-700/50">
                       <div className="flex items-center gap-2 text-orange-300 font-medium text-sm">
                           <AlertTriangle size={14}/> Requires Serato
                       </div>
                       {techReqs.serato.comment && <div className="text-xs text-slate-500 mt-1 pl-6">{techReqs.serato.comment}</div>}
                    </div>
                  )}
                  {techReqs.rekordbox?.enabled && (
                    <div className="py-2 border-b border-slate-700/50">
                       <div className="flex items-center gap-2 text-orange-300 font-medium text-sm">
                           <AlertTriangle size={14}/> Requires Rekordbox
                       </div>
                       {techReqs.rekordbox.comment && <div className="text-xs text-slate-500 mt-1 pl-6">{techReqs.rekordbox.comment}</div>}
                    </div>
                  )}
                  {techReqs.laptopInput?.enabled && (
                    <div className="py-2 border-b border-slate-700/50">
                       <div className="flex items-center gap-2 text-orange-300 font-medium text-sm">
                           <AlertTriangle size={14}/> Requires Laptop Input
                       </div>
                       {techReqs.laptopInput.comment && <div className="text-xs text-slate-500 mt-1 pl-6">{techReqs.laptopInput.comment}</div>}
                    </div>
                  )}
                  {techReqs.fourChannels?.enabled && (
                    <div className="py-2 border-b border-slate-700/50">
                       <div className="flex items-center gap-2 text-orange-300 font-medium text-sm">
                           <AlertTriangle size={14}/> Requires 4 Channels
                       </div>
                       {techReqs.fourChannels.comment && <div className="text-xs text-slate-500 mt-1 pl-6">{techReqs.fourChannels.comment}</div>}
                    </div>
                  )}

                  {/* Standard Tech Rider Items */}
                  {profile.techRider.map(item => (
                   <div key={item.id} className="py-2 border-b border-slate-700/50 last:border-0 flex items-start gap-2 text-slate-300 text-sm">
                     <CheckCircle size={16} className="text-indigo-400 shrink-0 mt-0.5" />
                     {item.name}
                   </div>
                  ))}
                  {profile.techRider.length === 0 && !techReqs.serato?.enabled && !techReqs.rekordbox?.enabled && !techReqs.laptopInput?.enabled && !techReqs.fourChannels?.enabled && (
                    <div className="text-slate-500 text-sm italic py-2 text-center">Standard Club Setup</div>
                  )}
               </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 animate-fade-in pb-20">
      <button onClick={() => setStep('PROFILE')} className="text-slate-400 hover:text-white mb-6 flex items-center gap-2">
        ← Back to Profile
      </button>

      <div className="bg-slate-800 rounded-xl p-8 border border-slate-700 shadow-xl">
        <h2 className="text-3xl font-bold text-white mb-2">Book {profile.name}</h2>
        {isPromoter && (
           <div className="flex items-center gap-2 text-amber-500 bg-amber-900/20 px-3 py-1 rounded-full w-fit mb-6 text-xs font-bold uppercase tracking-wide border border-amber-900/50">
             <User size={12} /> Booking as Premier Events Agency
           </div>
        )}
        
        <div className="space-y-8 mt-6">
          {/* Contact Info - Hidden for Promoters */}
          {!isPromoter && (
            <section className="space-y-4">
              <h3 className="text-lg font-semibold text-indigo-400 uppercase tracking-wider text-sm">Promoter Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Your Name / Agency</label>
                  <input required type="text" name="promoterName" value={offer.promoterName} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Email Address</label>
                  <input required type="email" name="promoterEmail" value={offer.promoterEmail} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-indigo-500" />
                </div>
              </div>
            </section>
          )}

          {/* Event Info */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-indigo-400 uppercase tracking-wider text-sm">Event Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                 <label className="block text-sm text-slate-400 mb-1">Date</label>
                 <div className="relative">
                   <Calendar className="absolute left-3 top-3 text-slate-500" size={18} />
                   <input required type="date" name="eventDate" value={offer.eventDate} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 pl-10 text-white outline-none focus:border-indigo-500" />
                 </div>
               </div>
               <div>
                 <label className="block text-sm text-slate-400 mb-1">Start Time</label>
                 <div className="relative">
                   <Clock className="absolute left-3 top-3 text-slate-500" size={18} />
                   <input required type="time" name="startTime" value={offer.startTime} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 pl-10 text-white outline-none focus:border-indigo-500" />
                 </div>
               </div>
               <div>
                 <label className="block text-sm text-slate-400 mb-1">Set Duration (Hours)</label>
                 <input required type="number" min="1" max="12" name="durationHours" value={offer.durationHours} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-indigo-500" />
               </div>
               <div>
                 <label className="block text-sm text-slate-400 mb-1">Venue / Location</label>
                 <div className="relative">
                   <MapPin className="absolute left-3 top-3 text-slate-500" size={18} />
                   <input required type="text" name="location" value={offer.location} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 pl-10 text-white outline-none focus:border-indigo-500" />
                 </div>
               </div>
            </div>
          </section>

          {/* Extras / Add-ons Selection */}
          {profile.extras && profile.extras.length > 0 && (
            <section className="space-y-4">
              <h3 className="text-lg font-semibold text-indigo-400 uppercase tracking-wider text-sm flex items-center gap-2">
                 <Package size={18} /> Equipment Hire & Additional Services
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {profile.extras.map(item => {
                  const isSelected = offer.selectedExtras.includes(item.id);
                  return (
                    <div 
                      key={item.id}
                      onClick={() => toggleExtra(item.id)}
                      className={`
                        p-4 rounded-lg border cursor-pointer flex justify-between items-center transition-all
                        ${isSelected ? 'bg-indigo-900/30 border-indigo-500' : 'bg-slate-900 border-slate-700 hover:border-slate-500'}
                      `}
                    >
                       <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded border flex items-center justify-center ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-slate-500'}`}>
                             {isSelected && <CheckCircle size={14} className="text-white" />}
                          </div>
                          <div>
                            <div className={`font-medium ${isSelected ? 'text-white' : 'text-slate-300'}`}>{item.name}</div>
                            <div className="text-xs text-slate-500 uppercase tracking-wider">{item.type}</div>
                          </div>
                       </div>
                       <div className="text-white font-mono font-medium">
                          + {profile.currency} {item.price}
                       </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Rates */}
          <section className="space-y-4 p-4 bg-slate-900/50 rounded-lg border border-slate-700">
            <h3 className="text-lg font-semibold text-indigo-400 uppercase tracking-wider text-sm">Rate Negotiation</h3>
            
            <div className="flex items-center justify-between mb-4">
               <span className="text-white">Standard Rate: {profile.currency} {profile.hourlyRate}/hr</span>
               <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" name="useStandardRate" checked={offer.useStandardRate} onChange={handleInputChange} className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  <span className="ml-3 text-sm font-medium text-slate-300">{offer.useStandardRate ? 'Accept Rate' : 'Counter Offer'}</span>
                </label>
            </div>

            {!offer.useStandardRate && (
              <div className="animate-fade-in bg-slate-800 p-4 rounded-lg border border-slate-600">
                <div className="flex items-center gap-2 mb-2 text-orange-400">
                   <AlertCircle size={18} />
                   <span className="text-sm font-semibold">Counter Offer Proposal</span>
                </div>
                <label className="block text-sm text-slate-400 mb-1">Proposed FLAT Fee Total ({profile.currency})</label>
                <div className="relative">
                   <DollarSign className="absolute left-3 top-3 text-slate-500" size={18} />
                   <input type="number" name="counterOfferAmount" value={offer.counterOfferAmount} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 pl-10 text-white outline-none focus:border-orange-500" />
                </div>
              </div>
            )}
          </section>

          {/* Extras */}
          <section className="space-y-4">
             <h3 className="text-lg font-semibold text-indigo-400 uppercase tracking-wider text-sm">Hospitality & Extras provided</h3>
             <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
               {[
                 { key: 'providesTransport', label: 'Transport', icon: <Car size={20}/> },
                 { key: 'providesAccommodation', label: 'Hotel', icon: <Hotel size={20}/> },
                 { key: 'providesFood', label: 'Dinner', icon: <Coffee size={20}/> },
                 { key: 'providesDrinks', label: 'Drinks', icon: <Wine size={20}/> },
               ].map(extra => (
                  <label key={extra.key} className={`
                    cursor-pointer flex flex-col items-center justify-center p-4 rounded-lg border transition-all
                    ${(offer as any)[extra.key] ? 'bg-indigo-900/30 border-indigo-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'}
                  `}>
                    <input type="checkbox" name={extra.key} checked={(offer as any)[extra.key]} onChange={handleInputChange} className="hidden" />
                    <div className="mb-2">{extra.icon}</div>
                    <span className="text-xs font-medium">{extra.label}</span>
                  </label>
               ))}
             </div>
             <div>
                <label className="block text-sm text-slate-400 mb-1">Additional Notes / Requirements</label>
                <textarea name="additionalNotes" value={offer.additionalNotes} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-indigo-500" rows={3} placeholder="Specific vibes, dress code, entry details..." />
             </div>
          </section>
          
          {/* Summary Footer */}
          <div className="pt-6 border-t border-slate-700 flex flex-col md:flex-row justify-between items-center gap-4">
             <div className="text-center md:text-left">
                <div className="text-sm text-slate-400">Estimated Total</div>
                <div className="text-3xl font-bold text-white">{profile.currency} {calculateTotal().toFixed(2)}</div>
             </div>
             <button 
               onClick={() => onSubmitOffer(offer)}
               disabled={!offer.promoterName || !offer.eventDate}
               className="w-full md:w-auto bg-green-600 hover:bg-green-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-lg shadow-lg shadow-green-900/20 transition-all flex items-center justify-center gap-2"
             >
               <Send size={20} /> Submit Offer
             </button>
          </div>

        </div>
      </div>
    </div>
  );
};