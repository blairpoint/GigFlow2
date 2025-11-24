import React, { useState, useEffect } from 'react';
import { DJProfile, BookingRequest, BookingStatus, UserMode } from '../types';
import { FileText, Loader2, Download, PieChart as PieIcon, PenTool, CheckCircle, ArrowLeft } from 'lucide-react';
import { generateContractText } from '../services/geminiService';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { jsPDF } from 'jspdf';

interface ContractViewProps {
  profile: DJProfile;
  booking: BookingRequest;
  userMode: UserMode;
  clientSignatureUrl?: string; // Passed from App state for Client
  onSignContract: (bookingId: string, signatureUrl: string, isArtist: boolean) => void;
  onBack: () => void;
}

export const ContractView: React.FC<ContractViewProps> = ({ 
  profile, 
  booking, 
  userMode,
  clientSignatureUrl,
  onSignContract,
  onBack
}) => {
  const [contractText, setContractText] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'SUMMARY' | 'CONTRACT'>('SUMMARY');

  const selectedExtraItems = profile.extras.filter(e => booking.selectedExtras.includes(e.id));
  const extrasTotal = selectedExtraItems.reduce((sum, item) => sum + item.price, 0);

  const calculateTotal = () => {
    const base = booking.useStandardRate 
      ? profile.hourlyRate * booking.durationHours 
      : Number(booking.counterOfferAmount);
    return base + extrasTotal;
  };

  const total = calculateTotal();
  const baseFee = total - extrasTotal;

  // Data for the chart
  const chartData = [
    { name: 'Performance Fee', value: baseFee },
    { name: 'Equipment & Services', value: extrasTotal },
  ];
  const validChartData = chartData.filter(d => d.value > 0);
  const COLORS = ['#6366f1', '#f59e0b']; // Indigo, Amber

  useEffect(() => {
    const fetchContract = async () => {
      setLoading(true);
      const text = await generateContractText(profile, booking, total);
      setContractText(text);
      setLoading(false);
    };
    fetchContract();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [booking.id]); 

  const handleDownloadPDF = () => {
    if (!contractText) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;
    const maxLineWidth = pageWidth - margin * 2;
    
    // Header
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Performance Contract", pageWidth / 2, 20, { align: "center" });
    
    // Meta
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Generated via GigFlow on ${new Date(booking.createdAt).toLocaleDateString()}`, pageWidth / 2, 28, { align: "center" });

    // Clean up Markdown
    const cleanText = contractText
      .replace(/\*\*(.*?)\*\*/g, '$1') 
      .replace(/^#+\s/gm, '') 
      .replace(/`/g, ''); 

    doc.setFontSize(11);
    const lines = doc.splitTextToSize(cleanText, maxLineWidth);
    
    let y = 40;
    const lineHeight = 6;

    lines.forEach((line: string) => {
      if (y > pageHeight - 60) { // Leave room for signatures at bottom
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin, y);
      y += lineHeight;
    });

    // Add Signatures if Signed
    if (booking.status === BookingStatus.SIGNED || booking.artistSigned || booking.clientSigned) {
      y = Math.max(y + 20, pageHeight - 60);
      if (y > pageHeight - 50) {
         doc.addPage();
         y = margin;
      }

      // Artist Signature
      doc.setFontSize(10);
      doc.text("Artist Signature:", margin, y);
      if (booking.artistSigned && profile.signatureUrl) {
        try {
           doc.addImage(profile.signatureUrl, 'PNG', margin, y + 5, 40, 20);
           doc.text(`Signed: ${profile.name}`, margin, y + 30);
        } catch (e) { console.error("Error adding artist signature to PDF", e); }
      } else {
         doc.text("[Not Signed]", margin, y + 10);
      }

      // Client Signature
      const clientX = pageWidth / 2 + margin;
      doc.text("Promoter Signature:", clientX, y);
      if (booking.clientSigned && booking.clientSignatureUrl) {
         try {
           doc.addImage(booking.clientSignatureUrl, 'PNG', clientX, y + 5, 40, 20);
           doc.text(`Signed: ${booking.promoterName}`, clientX, y + 30);
         } catch (e) { console.error("Error adding client signature to PDF", e); }
      } else {
        doc.text("[Not Signed]", clientX, y + 10);
      }
    }

    const fileName = `${profile.name.replace(/[^a-z0-9]/gi, '_')}_Contract.pdf`;
    doc.save(fileName);
  };

  const handleSigning = () => {
    if (userMode === UserMode.DJ) {
      if (profile.signatureUrl) {
        onSignContract(booking.id, profile.signatureUrl, true);
      } else {
        alert("Please upload a signature in your Profile Editor first.");
      }
    } else {
      if (clientSignatureUrl) {
        onSignContract(booking.id, clientSignatureUrl, false);
      } else {
        alert("Please upload your signature in the Inbox view first.");
      }
    }
  };

  const canSign = booking.status === BookingStatus.ACCEPTED || booking.status === BookingStatus.SIGNED;
  const isAlreadySignedByUser = userMode === UserMode.DJ ? booking.artistSigned : booking.clientSigned;

  return (
    <div className="max-w-5xl mx-auto p-6 animate-fade-in pb-20">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white mb-6">
         <ArrowLeft size={18} /> Back to Inbox
      </button>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
           <h1 className="text-3xl font-bold text-white">
             Booking Proposal <span className="text-slate-500 font-mono text-lg">#{booking.id.slice(0,6)}</span>
           </h1>
           <div className="flex items-center gap-2 mt-2">
              <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase border 
                ${booking.status === BookingStatus.SIGNED ? 'border-green-500/30 bg-green-900/20 text-green-400' : 'border-indigo-500/30 bg-indigo-900/20 text-indigo-400'}
              `}>
                {booking.status}
              </span>
           </div>
        </div>
      </div>

      <div className="flex gap-4 mb-6 border-b border-slate-700">
        <button 
          onClick={() => setActiveTab('SUMMARY')}
          className={`pb-3 px-4 font-medium transition-colors ${activeTab === 'SUMMARY' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-slate-400 hover:text-slate-200'}`}
        >
          Invoice & Summary
        </button>
        <button 
          onClick={() => setActiveTab('CONTRACT')}
          className={`pb-3 px-4 font-medium transition-colors ${activeTab === 'CONTRACT' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-slate-400 hover:text-slate-200'}`}
        >
          Legal Contract (AI)
        </button>
      </div>

      {activeTab === 'SUMMARY' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Invoice Box */}
          <div className="bg-white text-slate-900 rounded-xl p-8 shadow-xl">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">INVOICE</h2>
                <p className="text-slate-500 text-sm">#{booking.id.slice(0,6).toUpperCase()}</p>
              </div>
              <div className="text-right">
                <h3 className="font-bold">{profile.name}</h3>
                <p className="text-sm text-slate-600">{profile.email}</p>
              </div>
            </div>

            <div className="mb-8">
              <p className="text-xs uppercase font-bold text-slate-400 mb-1">Bill To</p>
              <p className="font-bold">{booking.promoterName}</p>
              <p className="text-sm text-slate-600">{booking.promoterEmail}</p>
            </div>

            <table className="w-full mb-8">
              <thead>
                <tr className="border-b-2 border-slate-100 text-left text-xs text-slate-500 uppercase">
                  <th className="py-2">Description</th>
                  <th className="py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-100">
                  <td className="py-4">
                    <p className="font-bold">DJ Performance ({booking.durationHours} hours)</p>
                    <p className="text-sm text-slate-500">{booking.eventDate} @ {booking.location}</p>
                  </td>
                  <td className="py-4 text-right font-mono">
                    {profile.currency} {baseFee.toFixed(2)}
                  </td>
                </tr>
                {selectedExtraItems.map((item) => (
                   <tr key={item.id} className="border-b border-slate-100">
                     <td className="py-4">
                       <p className="font-bold">{item.name}</p>
                       <p className="text-xs text-slate-500 uppercase">{item.type}</p>
                     </td>
                     <td className="py-4 text-right font-mono">
                       {profile.currency} {item.price.toFixed(2)}
                     </td>
                   </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-end mb-8">
              <div className="text-right">
                <p className="text-slate-500 text-sm mb-1">Total Due</p>
                <p className="text-3xl font-bold text-indigo-600">{profile.currency} {total.toFixed(2)}</p>
              </div>
            </div>

            {/* Bank Info Section on Invoice */}
            <div className="bg-slate-50 p-4 rounded-lg mb-4">
              <h4 className="text-xs font-bold uppercase text-slate-500 mb-2">Payment Information</h4>
              <div className="text-sm text-slate-700 space-y-1 font-mono">
                <div className="flex justify-between"><span>Bank:</span> <span>{profile.bankDetails.bankName || 'N/A'}</span></div>
                <div className="flex justify-between"><span>Name:</span> <span>{profile.bankDetails.accountName || 'N/A'}</span></div>
                <div className="flex justify-between"><span>Acc #:</span> <span>{profile.bankDetails.accountNumber || 'N/A'}</span></div>
                <div className="flex justify-between"><span>Reference:</span> <span>{profile.bankDetails.reference || 'N/A'}</span></div>
              </div>
            </div>
          </div>

          {/* Stats / Visuals */}
          <div className="space-y-6">
             <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <PieIcon size={20} className="text-indigo-400"/> Cost Breakdown
                </h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={validChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {validChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
             </div>
          </div>
        </div>
      )}

      {activeTab === 'CONTRACT' && (
        <div className="bg-slate-800 rounded-xl p-8 border border-slate-700 min-h-[500px] relative">
          {loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
              <p className="text-slate-300 animate-pulse">AI is drafting the contract...</p>
            </div>
          ) : (
            <div className="animate-fade-in">
              <div className="flex justify-between items-center mb-6 border-b border-slate-700 pb-4">
                 <h2 className="text-xl font-bold text-white flex items-center gap-2">
                   <FileText className="text-indigo-400" /> Performance Contract
                 </h2>
                 <button 
                    onClick={handleDownloadPDF}
                    className="flex items-center gap-2 text-sm bg-slate-700 hover:bg-slate-600 px-3 py-2 rounded-lg transition-colors text-white"
                 >
                   <Download size={16} /> Download PDF
                 </button>
              </div>
              
              <div className="prose prose-invert max-w-none text-slate-300 whitespace-pre-wrap font-serif leading-relaxed mb-12">
                {contractText}
              </div>

              {/* Signature Area */}
              <div className="border-t border-slate-700 pt-8 mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                 {/* Artist Signature */}
                 <div className="bg-slate-900 p-6 rounded-lg border border-slate-700">
                    <div className="text-sm text-slate-400 mb-2 uppercase tracking-wide">Artist (DJ)</div>
                    <div className="h-24 flex items-center justify-center border-b border-dashed border-slate-600 mb-2">
                      {booking.artistSigned && profile.signatureUrl ? (
                         <img src={profile.signatureUrl} alt="Artist Signature" className="h-20 object-contain" />
                      ) : (
                        <span className="text-slate-600 italic">Waiting for signature</span>
                      )}
                    </div>
                    <div className="font-bold text-white">{profile.name}</div>
                    <div className="text-xs text-slate-500">Date: {booking.artistSigned ? new Date().toLocaleDateString() : 'Pending'}</div>
                 </div>

                 {/* Promoter Signature */}
                 <div className="bg-slate-900 p-6 rounded-lg border border-slate-700">
                    <div className="text-sm text-slate-400 mb-2 uppercase tracking-wide">Promoter (Client)</div>
                    <div className="h-24 flex items-center justify-center border-b border-dashed border-slate-600 mb-2">
                      {booking.clientSigned && booking.clientSignatureUrl ? (
                         <img src={booking.clientSignatureUrl} alt="Client Signature" className="h-20 object-contain" />
                      ) : (
                        <span className="text-slate-600 italic">Waiting for signature</span>
                      )}
                    </div>
                    <div className="font-bold text-white">{booking.promoterName}</div>
                    <div className="text-xs text-slate-500">Date: {booking.clientSigned ? new Date().toLocaleDateString() : 'Pending'}</div>
                 </div>
              </div>
              
              {/* Signing Actions */}
              {canSign && !isAlreadySignedByUser && (
                <div className="mt-8 flex justify-end">
                   <button 
                     onClick={handleSigning}
                     className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-indigo-500/20 flex items-center gap-2 transform transition-transform hover:scale-105"
                   >
                     <PenTool size={20} /> Sign Contract Now
                   </button>
                </div>
              )}

              {isAlreadySignedByUser && (
                <div className="mt-8 flex justify-end">
                  <div className="flex items-center gap-2 text-green-400 bg-green-900/20 px-4 py-2 rounded-lg border border-green-500/30">
                     <CheckCircle size={20} /> You have signed this contract.
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};