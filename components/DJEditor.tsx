import React, { useState } from 'react';
import { DJProfile, TechItem, GigItem, GigType, GenreItem, AdvancedTechRequirements, ExtraItem } from '../types';
import { Save, Plus, Trash2, Sparkles, Calendar, Link as LinkIcon, CreditCard, Settings, Music, Package, CheckSquare, List, PenTool, Upload } from 'lucide-react';
import { enhanceBio } from '../services/geminiService';
import { DEFAULT_TECH_REQUIREMENTS } from '../constants';

interface DJEditorProps {
  profile: DJProfile;
  onSave: (profile: DJProfile) => void;
}

export const DJEditor: React.FC<DJEditorProps> = ({ profile, onSave }) => {
  // Initialize with fallbacks for safety against stale state
  const [localProfile, setLocalProfile] = useState<DJProfile>({
    ...profile,
    schedule: profile.schedule || [],
    bankDetails: profile.bankDetails || {
      bankName: '',
      accountName: '',
      accountNumber: '',
      reference: ''
    },
    techRequirements: profile.techRequirements || DEFAULT_TECH_REQUIREMENTS,
    genres: profile.genres || [],
    extras: profile.extras || [],
    signatureUrl: profile.signatureUrl || ''
  });
  
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [newTechItem, setNewTechItem] = useState('');
  
  // Schedule State
  const [newGigDate, setNewGigDate] = useState('');
  const [newGigName, setNewGigName] = useState('');
  const [newGigType, setNewGigType] = useState<GigType>('FUTURE');
  const [newGigLink, setNewGigLink] = useState('');

  // Genre State
  const [newGenreName, setNewGenreName] = useState('');
  const [newGenreLinkInputs, setNewGenreLinkInputs] = useState<Record<string, string>>({});

  // Extras State
  const [newExtraName, setNewExtraName] = useState('');
  const [newExtraPrice, setNewExtraPrice] = useState('');
  const [newExtraType, setNewExtraType] = useState<'EQUIPMENT' | 'SERVICE'>('EQUIPMENT');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setLocalProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleBankChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLocalProfile(prev => ({
      ...prev,
      bankDetails: { ...prev.bankDetails, [name]: value }
    }));
  };

  const handleRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalProfile(prev => ({ ...prev, hourlyRate: Number(e.target.value) }));
  };

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLocalProfile(prev => ({ ...prev, signatureUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const clearSignature = () => {
    setLocalProfile(prev => ({ ...prev, signatureUrl: '' }));
  };

  const addTechItem = () => {
    if (!newTechItem.trim()) return;
    const newItem: TechItem = {
      id: Date.now().toString(),
      name: newTechItem,
      essential: true
    };
    setLocalProfile(prev => ({
      ...prev,
      techRider: [...prev.techRider, newItem]
    }));
    setNewTechItem('');
  };

  const removeTechItem = (id: string) => {
    setLocalProfile(prev => ({
      ...prev,
      techRider: prev.techRider.filter(item => item.id !== id)
    }));
  };

  // Specific Tech Requirement Handlers
  const toggleTechRequirement = (key: keyof AdvancedTechRequirements) => {
    setLocalProfile(prev => ({
      ...prev,
      techRequirements: {
        ...prev.techRequirements,
        [key]: {
          ...prev.techRequirements[key],
          enabled: !prev.techRequirements[key].enabled
        }
      }
    }));
  };

  const updateTechRequirementComment = (key: keyof AdvancedTechRequirements, comment: string) => {
    setLocalProfile(prev => ({
      ...prev,
      techRequirements: {
        ...prev.techRequirements,
        [key]: {
          ...prev.techRequirements[key],
          comment
        }
      }
    }));
  };

  // Genre Handlers
  const addGenre = () => {
    if (!newGenreName.trim()) return;
    const newGenre: GenreItem = {
      id: Date.now().toString(),
      name: newGenreName,
      links: []
    };
    setLocalProfile(prev => ({
      ...prev,
      genres: [...prev.genres, newGenre]
    }));
    setNewGenreName('');
  };

  const removeGenre = (id: string) => {
    setLocalProfile(prev => ({
      ...prev,
      genres: prev.genres.filter(g => g.id !== id)
    }));
  };

  const addLinkToGenre = (genreId: string) => {
    const link = newGenreLinkInputs[genreId];
    if (!link?.trim()) return;

    setLocalProfile(prev => ({
      ...prev,
      genres: prev.genres.map(g => {
        if (g.id === genreId) {
          return { ...g, links: [...g.links, link] };
        }
        return g;
      })
    }));

    setNewGenreLinkInputs(prev => ({ ...prev, [genreId]: '' }));
  };

  const removeLinkFromGenre = (genreId: string, linkIndex: number) => {
    setLocalProfile(prev => ({
      ...prev,
      genres: prev.genres.map(g => {
        if (g.id === genreId) {
          return { ...g, links: g.links.filter((_, i) => i !== linkIndex) };
        }
        return g;
      })
    }));
  };

  // Extras Handlers
  const addExtra = () => {
    if (!newExtraName.trim() || !newExtraPrice) return;
    const newExtra: ExtraItem = {
      id: Date.now().toString(),
      name: newExtraName,
      price: Number(newExtraPrice),
      type: newExtraType
    };
    setLocalProfile(prev => ({
      ...prev,
      extras: [...prev.extras, newExtra]
    }));
    setNewExtraName('');
    setNewExtraPrice('');
  };

  const removeExtra = (id: string) => {
    setLocalProfile(prev => ({
      ...prev,
      extras: prev.extras.filter(e => e.id !== id)
    }));
  };

  const addGigItem = () => {
    if (!newGigDate || !newGigName) return;
    const newItem: GigItem = {
      id: Date.now().toString(),
      date: newGigDate,
      eventName: newGigName,
      type: newGigType,
      link: newGigType === 'PAST' ? newGigLink : undefined
    };
    setLocalProfile(prev => ({
      ...prev,
      schedule: [...prev.schedule, newItem].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    }));
    setNewGigDate('');
    setNewGigName('');
    setNewGigLink('');
  };

  const removeGigItem = (id: string) => {
    setLocalProfile(prev => ({
      ...prev,
      schedule: prev.schedule.filter(item => item.id !== id)
    }));
  };

  const handleEnhanceBio = async () => {
    setIsEnhancing(true);
    const newBio = await enhanceBio(localProfile.bio);
    setLocalProfile(prev => ({ ...prev, bio: newBio }));
    setIsEnhancing(false);
  };

  const handleSave = () => {
    onSave(localProfile);
    alert("Profile saved successfully!");
  };

  const TECH_REQ_FIELDS = [
    { key: 'serato', label: 'Requires Serato Compatibility' },
    { key: 'rekordbox', label: 'Requires Rekordbox' },
    { key: 'laptopInput', label: 'Requires Laptop Input' },
    { key: 'fourChannels', label: 'Requires 4 Channels' },
  ] as const;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 animate-fade-in pb-20">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">DJ Profile Settings</h1>
          <p className="text-slate-400">Set up your booking page for promoters.</p>
        </div>
        <div className="flex gap-3">
             <button 
            onClick={handleSave}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Save size={18} /> Save Changes
          </button>
        </div>
      </div>

      {/* Grid Container */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column: Personal Info & Genres */}
        <div className="space-y-8">
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-lg">
            <h2 className="text-xl font-semibold text-white mb-4">Basic Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Stage Name</label>
                <input
                  type="text"
                  name="name"
                  value={localProfile.name}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Contact Email</label>
                <input
                  type="email"
                  name="email"
                  value={localProfile.email}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Hourly Rate ({localProfile.currency})</label>
                <input
                  type="number"
                  name="hourlyRate"
                  value={localProfile.hourlyRate}
                  onChange={handleRateChange}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">SoundCloud / Mix URL (Primary)</label>
                <input
                  type="url"
                  name="soundcloudUrl"
                  value={localProfile.soundcloudUrl}
                  onChange={handleChange}
                  placeholder="https://soundcloud.com/..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-slate-400">Bio</label>
                  <button 
                    onClick={handleEnhanceBio}
                    disabled={isEnhancing}
                    className="text-xs flex items-center gap-1 text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    <Sparkles size={12} /> {isEnhancing ? 'Enhancing...' : 'AI Enhance'}
                  </button>
                </div>
                <textarea
                  name="bio"
                  value={localProfile.bio}
                  onChange={handleChange}
                  rows={5}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                />
              </div>
            </div>
          </div>

           {/* Legal & Signature */}
           <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-lg">
             <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
               <PenTool size={20} className="text-orange-400" /> Digital Signature
             </h2>
             <p className="text-sm text-slate-400 mb-4">Upload a scan of your signature to be used on contracts.</p>
             
             {localProfile.signatureUrl ? (
               <div className="bg-white p-4 rounded-lg mb-4 relative group">
                  <img src={localProfile.signatureUrl} alt="Signature" className="h-16 object-contain mx-auto" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                    <button onClick={clearSignature} className="bg-red-600 text-white px-3 py-1 rounded text-sm flex items-center gap-2">
                      <Trash2 size={14} /> Remove
                    </button>
                  </div>
               </div>
             ) : (
               <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center hover:border-indigo-500 transition-colors cursor-pointer relative">
                 <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleSignatureUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                 />
                 <Upload className="mx-auto text-slate-500 mb-2" size={24} />
                 <p className="text-slate-400 text-sm">Click to upload image</p>
                 <p className="text-slate-600 text-xs mt-1">PNG with transparent background recommended</p>
               </div>
             )}
          </div>

          {/* Genres Section */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-lg">
             <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
               <Music size={20} className="text-pink-400" /> Genres & Music
             </h2>
             {/* Add Genre Input */}
             <div className="flex gap-2 mb-6">
                <input
                  type="text"
                  value={newGenreName}
                  onChange={(e) => setNewGenreName(e.target.value)}
                  placeholder="Genre Name (e.g. Deep House)"
                  onKeyDown={(e) => e.key === 'Enter' && addGenre()}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <button onClick={addGenre} className="bg-pink-600 hover:bg-pink-500 text-white px-4 rounded-lg">
                  <Plus size={20} />
                </button>
             </div>

             {/* Genres List */}
             <div className="space-y-4">
                {localProfile.genres.map(genre => (
                  <div key={genre.id} className="bg-slate-900/50 rounded-lg border border-slate-700 p-4">
                     <div className="flex justify-between items-center mb-3">
                        <span className="font-bold text-white text-lg">{genre.name}</span>
                        <button onClick={() => removeGenre(genre.id)} className="text-slate-500 hover:text-red-400"><Trash2 size={16}/></button>
                     </div>
                     
                     {/* Links List for Genre */}
                     <ul className="space-y-2 mb-3">
                        {genre.links.map((link, idx) => (
                           <li key={idx} className="flex items-center gap-2 text-sm text-indigo-300 bg-slate-800 p-2 rounded">
                              <LinkIcon size={12} />
                              <span className="truncate flex-1">{link}</span>
                              <button onClick={() => removeLinkFromGenre(genre.id, idx)} className="text-slate-500 hover:text-red-400"><Trash2 size={12}/></button>
                           </li>
                        ))}
                     </ul>

                     {/* Add Link Input */}
                     <div className="flex gap-2">
                       <input 
                         type="text" 
                         placeholder="Paste Mix Link..." 
                         className="flex-1 bg-slate-800 border border-slate-700 rounded p-2 text-xs text-white"
                         value={newGenreLinkInputs[genre.id] || ''}
                         onChange={(e) => setNewGenreLinkInputs(prev => ({...prev, [genre.id]: e.target.value}))}
                         onKeyDown={(e) => e.key === 'Enter' && addLinkToGenre(genre.id)}
                       />
                       <button onClick={() => addLinkToGenre(genre.id)} className="text-xs bg-slate-700 hover:bg-slate-600 px-3 rounded text-white">Add</button>
                     </div>
                  </div>
                ))}
                {localProfile.genres.length === 0 && <p className="text-slate-500 italic text-center">No genres added.</p>}
             </div>
          </div>

          {/* Bank Info */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-lg">
             <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
               <CreditCard size={20} className="text-emerald-400" /> Payment Information
             </h2>
             
             <div className="space-y-4">
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-sm font-medium text-slate-400 mb-1">Bank Name</label>
                   <input type="text" name="bankName" value={localProfile.bankDetails?.bankName || ''} onChange={handleBankChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white outline-none" placeholder="e.g. Chase" />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-slate-400 mb-1">Account Name</label>
                   <input type="text" name="accountName" value={localProfile.bankDetails?.accountName || ''} onChange={handleBankChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white outline-none" placeholder="Full Name" />
                 </div>
               </div>
               <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Account Number</label>
                  <input type="text" name="accountNumber" value={localProfile.bankDetails?.accountNumber || ''} onChange={handleBankChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white outline-none" />
               </div>
               <div>
                 <label className="block text-sm font-medium text-slate-400 mb-1">Reference</label>
                 <input type="text" name="reference" value={localProfile.bankDetails?.reference || ''} onChange={handleBankChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white outline-none" placeholder="Invoice Reference / Code" />
               </div>
             </div>
          </div>
        </div>

        {/* Right Column: Unified Tech Rider & Extras & Schedule */}
        <div className="space-y-8">
          
          {/* Combined Technical Requirements */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-lg">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Settings size={20} className="text-blue-400" /> Technical Requirements
            </h2>
            
            {/* Part 1: Setup Requirements (Checkboxes) */}
            <div className="mb-6 space-y-3">
               <h3 className="text-xs font-bold uppercase text-slate-500 flex items-center gap-2">
                 <CheckSquare size={14} /> Setup Compatibility
               </h3>
               <div className="space-y-3">
                {TECH_REQ_FIELDS.map(({ key, label }) => (
                  <div key={key} className="bg-slate-900/50 p-3 rounded-lg border border-slate-700">
                    <label className="flex items-center cursor-pointer">
                      <div className="relative">
                        <input 
                          type="checkbox" 
                          checked={localProfile.techRequirements[key].enabled} 
                          onChange={() => toggleTechRequirement(key)} 
                          className="sr-only"
                        />
                        <div className={`w-9 h-5 bg-slate-700 rounded-full shadow-inner transition-colors ${localProfile.techRequirements[key].enabled ? '!bg-blue-600' : ''}`}></div>
                        <div className={`absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${localProfile.techRequirements[key].enabled ? 'translate-x-4' : ''}`}></div>
                      </div>
                      <span className="ml-3 font-medium text-sm text-slate-200">{label}</span>
                    </label>
                    
                    {localProfile.techRequirements[key].enabled && (
                      <div className="ml-1 mt-2 pl-2">
                        <input 
                          type="text" 
                          placeholder="Add specific details or comments..."
                          className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-xs text-white focus:border-blue-500 outline-none"
                          value={localProfile.techRequirements[key].comment}
                          onChange={(e) => updateTechRequirementComment(key, e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                ))}
               </div>
            </div>

            <div className="h-px bg-slate-700 my-6"></div>

            {/* Part 2: Equipment List (Venue Provides) */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase text-slate-500 flex items-center gap-2">
                <List size={14} /> Venue Equipment List
              </h3>
              
              <div className="space-y-2 mb-4">
                {localProfile.techRider.map(item => (
                  <div key={item.id} className="flex justify-between items-center bg-slate-900 p-3 rounded-lg border border-slate-700">
                    <span className="text-slate-200 text-sm">{item.name}</span>
                    <button 
                      onClick={() => removeTechItem(item.id)}
                      className="text-slate-600 hover:text-red-400"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                {localProfile.techRider.length === 0 && (
                  <p className="text-slate-500 italic text-center py-2 text-sm">No items added.</p>
                )}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTechItem}
                  onChange={(e) => setNewTechItem(e.target.value)}
                  placeholder="e.g. Pioneer CDJ-3000"
                  onKeyDown={(e) => e.key === 'Enter' && addTechItem()}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <button 
                  onClick={addTechItem}
                  className="bg-slate-700 hover:bg-slate-600 text-white px-3 rounded-lg transition-colors"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Extras / Add-ons Section */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-lg">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
               <Package size={20} className="text-yellow-400" /> Add-ons & Extras
            </h2>
            <p className="text-sm text-slate-400 mb-4">List equipment or services you can provide for an extra fee.</p>

             <div className="space-y-3 mb-6">
                {localProfile.extras.map(item => (
                   <div key={item.id} className="flex items-center justify-between bg-slate-900 p-3 rounded-lg border border-slate-700">
                      <div>
                         <div className="text-slate-200 font-medium">{item.name}</div>
                         <div className="text-xs text-slate-500 flex items-center gap-2">
                            <span className={`px-1.5 py-0.5 rounded ${item.type === 'EQUIPMENT' ? 'bg-blue-900/30 text-blue-400' : 'bg-green-900/30 text-green-400'}`}>
                               {item.type}
                            </span>
                         </div>
                      </div>
                      <div className="flex items-center gap-4">
                         <span className="text-white font-mono">{localProfile.currency} {item.price}</span>
                         <button onClick={() => removeExtra(item.id)} className="text-slate-600 hover:text-red-400"><Trash2 size={16} /></button>
                      </div>
                   </div>
                ))}
                {localProfile.extras.length === 0 && <p className="text-slate-500 italic text-center py-2">No extras listed.</p>}
             </div>

             <div className="bg-slate-900 p-4 rounded-lg border border-slate-700">
                <h3 className="text-xs font-bold uppercase text-slate-500 mb-3">Add New Item</h3>
                <div className="grid grid-cols-2 gap-3 mb-3">
                   <input 
                      type="text" 
                      placeholder="Item Name (e.g. Lighting)" 
                      className="col-span-2 bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm outline-none"
                      value={newExtraName}
                      onChange={(e) => setNewExtraName(e.target.value)}
                   />
                   <div className="relative">
                      <span className="absolute left-2 top-2 text-slate-500 text-sm">$</span>
                      <input 
                        type="number" 
                        placeholder="Price" 
                        className="w-full bg-slate-800 border border-slate-700 rounded p-2 pl-6 text-white text-sm outline-none"
                        value={newExtraPrice}
                        onChange={(e) => setNewExtraPrice(e.target.value)}
                      />
                   </div>
                   <select 
                     className="bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm outline-none"
                     value={newExtraType}
                     onChange={(e) => setNewExtraType(e.target.value as any)}
                   >
                      <option value="EQUIPMENT">Equipment</option>
                      <option value="SERVICE">Service</option>
                   </select>
                </div>
                <button onClick={addExtra} className="w-full bg-yellow-600 hover:bg-yellow-500 text-white py-2 rounded text-sm font-medium transition-colors">Add Item</button>
             </div>
          </div>

          {/* Gig History & Schedule */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-lg">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
               <Calendar size={20} className="text-purple-400"/> Gig History & Schedule
            </h2>
            
            {/* Add Form */}
            <div className="bg-slate-900 p-4 rounded-lg border border-slate-700 mb-6">
              <h3 className="text-xs font-bold uppercase text-slate-500 mb-3">Add New Entry</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <input type="date" value={newGigDate} onChange={(e) => setNewGigDate(e.target.value)} className="bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm outline-none" />
                <select value={newGigType} onChange={(e) => setNewGigType(e.target.value as GigType)} className="bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm outline-none">
                  <option value="PAST">Past Gig</option>
                  <option value="FUTURE">Future Booked</option>
                  <option value="AVAILABLE">Available Date</option>
                </select>
                <input type="text" value={newGigName} onChange={(e) => setNewGigName(e.target.value)} placeholder="Event / Venue Name" className="bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm outline-none sm:col-span-2" />
                {newGigType === 'PAST' && (
                  <input type="url" value={newGigLink} onChange={(e) => setNewGigLink(e.target.value)} placeholder="Soundcloud Link (Optional)" className="bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm outline-none sm:col-span-2" />
                )}
              </div>
              <button onClick={addGigItem} className="w-full bg-purple-600 hover:bg-purple-500 text-white py-2 rounded text-sm font-medium transition-colors">Add Entry</button>
            </div>

            {/* List */}
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {localProfile.schedule && localProfile.schedule.map(item => (
                <div key={item.id} className="flex items-center justify-between bg-slate-900 p-3 rounded border border-slate-700 group">
                  <div className="flex-1 min-w-0 mr-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold tracking-wider 
                        ${item.type === 'PAST' ? 'bg-slate-700 text-slate-300' : 
                          item.type === 'AVAILABLE' ? 'bg-green-900/50 text-green-400' : 'bg-purple-900/50 text-purple-400'}
                      `}>
                        {item.type}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">{item.date}</span>
                    </div>
                    <div className="text-white text-sm truncate font-medium mt-1">{item.eventName}</div>
                    {item.link && (
                      <a href={item.link} target="_blank" rel="noreferrer" className="text-xs text-indigo-400 flex items-center gap-1 mt-1 hover:underline">
                        <LinkIcon size={10} /> Listen
                      </a>
                    )}
                  </div>
                  <button onClick={() => removeGigItem(item.id)} className="text-slate-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              {(!localProfile.schedule || localProfile.schedule.length === 0) && <p className="text-center text-slate-600 text-sm py-2">No schedule items.</p>}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};