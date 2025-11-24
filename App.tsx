import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { DJEditor } from './components/DJEditor';
import { ClientBooker } from './components/ClientBooker';
import { ContractView } from './components/ContractView';
import { Inbox } from './components/Inbox';
import { LoginPage } from './components/LoginPage';
import { PromoterDashboard } from './components/PromoterDashboard';
import { UserMode, DJProfile, OfferDetails, BookingRequest, BookingStatus, Event, EventAsset } from './types';
import { INITIAL_DJ_PROFILE, DEFAULT_TECH_REQUIREMENTS } from './constants';

const App: React.FC = () => {
  const [mode, setMode] = useState<UserMode>(UserMode.LOGIN);
  const [profile, setProfile] = useState<DJProfile>(INITIAL_DJ_PROFILE);
  
  // Client specific state
  const [clientSignatureUrl, setClientSignatureUrl] = useState<string>('');

  // Promoter specific state
  const [events, setEvents] = useState<Event[]>([]);
  const [activePromoterEventId, setActivePromoterEventId] = useState<string | null>(null);

  // The "Database" of bookings
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);

  // Self-healing: Ensure profile has all required fields even if state is stale
  const sanitizedProfile: DJProfile = {
    ...INITIAL_DJ_PROFILE,
    ...profile,
    bankDetails: profile.bankDetails || INITIAL_DJ_PROFILE.bankDetails,
    schedule: profile.schedule || [],
    techRequirements: profile.techRequirements || DEFAULT_TECH_REQUIREMENTS,
    genres: profile.genres || [],
    extras: profile.extras || [],
    signatureUrl: profile.signatureUrl || ''
  };

  // Handle Login
  const handleLogin = (targetMode: UserMode) => {
    setMode(targetMode);
    setSelectedBookingId(null);
  };

  const handleDJSave = (updatedProfile: DJProfile) => {
    setProfile(updatedProfile);
  };

  // When Client (or Promoter) submits an offer
  const handleOfferSubmit = (offer: OfferDetails) => {
    const bookingId = Date.now().toString();
    
    // Calculate cost for promoter asset
    let cost = 0;
    if (offer.useStandardRate) {
      cost = profile.hourlyRate * offer.durationHours;
    } else {
      cost = Number(offer.counterOfferAmount);
    }
    // Add extras
    const extrasTotal = profile.extras
      .filter(e => offer.selectedExtras.includes(e.id))
      .reduce((sum, e) => sum + e.price, 0);
    cost += extrasTotal;

    const newBooking: BookingRequest = {
      ...offer,
      id: bookingId, 
      createdAt: new Date().toISOString(),
      status: BookingStatus.PENDING,
      artistSigned: false,
      clientSigned: false,
      eventId: activePromoterEventId || undefined // Link to event if promoter
    };

    setBookings(prev => [newBooking, ...prev]);

    // If this was initiated by a Promoter for an Event
    if (activePromoterEventId) {
      const asset: EventAsset = {
        id: Date.now().toString(),
        name: `DJ Booking: ${profile.name}`,
        type: 'ARTIST',
        cost: cost,
        quantity: 1,
        bookingId: bookingId
      };

      setEvents(prev => prev.map(e => {
        if (e.id === activePromoterEventId) {
          return { ...e, assets: [...e.assets, asset] };
        }
        return e;
      }));

      // Return to dashboard
      setMode(UserMode.PROMOTER);
      setActivePromoterEventId(null);
    } else {
      // Normal Client flow
      setMode(UserMode.INBOX);
    }
  };

  const handleSelectBooking = (id: string) => {
    setSelectedBookingId(id);
    setMode(UserMode.CONTRACT);
  };

  const handleUpdateStatus = (id: string, status: BookingStatus) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
  };

  const handleSignContract = (bookingId: string, signatureUrl: string, isArtist: boolean) => {
    setBookings(prev => prev.map(b => {
      if (b.id !== bookingId) return b;
      
      const updated = { ...b };
      if (isArtist) {
        updated.artistSigned = true;
      } else {
        updated.clientSigned = true;
        updated.clientSignatureUrl = signatureUrl;
      }

      // Check if both signed
      if (updated.artistSigned && updated.clientSigned) {
        updated.status = BookingStatus.SIGNED;
      }

      return updated;
    }));
  };

  // Render Logic
  if (mode === UserMode.LOGIN) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return <AppContent 
    mode={mode} 
    setMode={setMode}
    profile={sanitizedProfile}
    setProfile={setProfile}
    bookings={bookings}
    setBookings={setBookings}
    selectedBookingId={selectedBookingId}
    setSelectedBookingId={setSelectedBookingId}
    clientSignatureUrl={clientSignatureUrl}
    setClientSignatureUrl={setClientSignatureUrl}
    events={events}
    setEvents={setEvents}
    onOfferSubmit={handleOfferSubmit}
    setActivePromoterEventId={setActivePromoterEventId}
  />;
};

// Extracted Content Component to handle Session State cleanly
const AppContent: React.FC<{
  mode: UserMode;
  setMode: (m: UserMode) => void;
  profile: DJProfile;
  setProfile: (p: DJProfile) => void;
  bookings: BookingRequest[];
  setBookings: React.Dispatch<React.SetStateAction<BookingRequest[]>>;
  selectedBookingId: string | null;
  setSelectedBookingId: (id: string | null) => void;
  clientSignatureUrl: string;
  setClientSignatureUrl: (url: string) => void;
  events: Event[];
  setEvents: React.Dispatch<React.SetStateAction<Event[]>>;
  onOfferSubmit: (offer: OfferDetails) => void;
  setActivePromoterEventId: (id: string | null) => void;
}> = ({ 
  mode, setMode, 
  profile, setProfile, 
  bookings, setBookings,
  selectedBookingId, setSelectedBookingId,
  clientSignatureUrl, setClientSignatureUrl,
  events, setEvents,
  onOfferSubmit,
  setActivePromoterEventId
}) => {
  const [sessionType, setSessionType] = useState<UserMode>(UserMode.LOGIN);

  // Intercept the initial login to set session
  React.useEffect(() => {
    if (mode === UserMode.DJ && sessionType === UserMode.LOGIN) setSessionType(UserMode.DJ);
    if (mode === UserMode.CLIENT && sessionType === UserMode.LOGIN) setSessionType(UserMode.CLIENT);
    if (mode === UserMode.PROMOTER && sessionType === UserMode.LOGIN) setSessionType(UserMode.PROMOTER);
  }, [mode, sessionType]);

  const handleLogout = () => {
    setMode(UserMode.LOGIN);
    setSessionType(UserMode.LOGIN);
    setSelectedBookingId(null);
  };

  const handleNavigateHome = () => {
    if (sessionType === UserMode.DJ) setMode(UserMode.DJ);
    else if (sessionType === UserMode.PROMOTER) setMode(UserMode.PROMOTER);
    else setMode(UserMode.CLIENT);
  };

  const getColorScheme = () => {
    if (sessionType === UserMode.PROMOTER) return 'amber';
    return sessionType === UserMode.DJ ? 'slate' : 'zinc';
  };

  const activeBooking = bookings.find(b => b.id === selectedBookingId);

  const renderContent = () => {
    switch (mode) {
      case UserMode.DJ:
        // Strict role check
        if (sessionType !== UserMode.DJ) return <AccessDenied role="Artist" />;
        return (
          <DJEditor 
            profile={profile} 
            onSave={(p) => setProfile(p)} 
          />
        );

      case UserMode.PROMOTER:
        if (sessionType !== UserMode.PROMOTER) return <AccessDenied role="Promoter" />;
        return (
          <PromoterDashboard 
            events={events}
            djProfile={profile}
            onAddEvent={(e) => setEvents(prev => [...prev, e])}
            onUpdateEvent={(e) => setEvents(prev => prev.map(ev => ev.id === e.id ? e : ev))}
            onBookArtist={(eventId) => {
              setActivePromoterEventId(eventId);
              setMode(UserMode.CLIENT); // Reuse the Client Booker view
            }}
          />
        );

      case UserMode.CLIENT:
        // Both Client and Promoter can use the Booker
        if (sessionType !== UserMode.CLIENT && sessionType !== UserMode.PROMOTER) {
             return <AccessDenied role="Client or Promoter" />;
        }
        return (
          <ClientBooker 
            profile={profile} 
            onSubmitOffer={onOfferSubmit} 
            currentUserMode={sessionType}
          />
        );

      case UserMode.INBOX:
        return (
          <Inbox 
             bookings={
               sessionType === UserMode.DJ ? bookings : 
               sessionType === UserMode.PROMOTER ? bookings : // Promoter sees all for now
               bookings // Client sees their own (in real app filtered by ID)
             } 
             userMode={sessionType}
             onSelectBooking={(id) => {
               setSelectedBookingId(id);
               setMode(UserMode.CONTRACT);
             }}
             onUpdateStatus={(id, status) => {
               setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
             }}
             clientSignatureUrl={clientSignatureUrl}
             onClientSignatureUpload={setClientSignatureUrl}
          />
        );

      case UserMode.CONTRACT:
        return activeBooking ? (
          <ContractView 
            profile={profile} 
            booking={activeBooking}
            userMode={sessionType}
            clientSignatureUrl={clientSignatureUrl}
            onBack={() => setMode(UserMode.INBOX)}
            onSignContract={(id, sig, isArtist) => {
               setBookings(prev => prev.map(b => {
                if (b.id !== id) return b;
                const updated = { ...b };
                if (isArtist) updated.artistSigned = true;
                else {
                  updated.clientSigned = true;
                  updated.clientSignatureUrl = sig;
                }
                if (updated.artistSigned && updated.clientSigned) updated.status = BookingStatus.SIGNED;
                return updated;
              }));
            }}
          />
        ) : (
          <div className="text-center text-white mt-20">Booking not found.</div>
        );
      default:
        return null;
    }
  };

  return (
    <Layout 
      userMode={sessionType} 
      colorScheme={getColorScheme()}
      onLogout={handleLogout}
      onNavigateToInbox={() => setMode(UserMode.INBOX)}
      onNavigateToHome={handleNavigateHome}
      notificationCount={sessionType === UserMode.DJ ? bookings.filter(b => b.status === BookingStatus.PENDING).length : 0}
    >
      {renderContent()}
    </Layout>
  );
};

const AccessDenied = ({ role }: { role: string }) => (
  <div className="flex flex-col items-center justify-center min-h-[50vh] text-red-400">
      <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
      <p>You must be logged in as a {role} to view this page.</p>
  </div>
);

export default App;