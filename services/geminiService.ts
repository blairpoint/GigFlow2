import { GoogleGenAI } from "@google/genai";
import { DJProfile, OfferDetails } from "../types";

const createAIClient = () => {
  // In a real app, error handling for missing key would be here or UI level
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateContractText = async (
  profile: DJProfile,
  offer: OfferDetails,
  totalAmount: number
): Promise<string> => {
  const ai = createAIClient();
  
  // Format specific tech requirements
  const techReqs = profile.techRequirements;
  const specificTechLines = [];
  if (techReqs?.serato?.enabled) specificTechLines.push(`- **Requires Serato Compatibility**: ${techReqs.serato.comment || 'Yes'}`);
  if (techReqs?.rekordbox?.enabled) specificTechLines.push(`- **Requires Rekordbox Compatibility**: ${techReqs.rekordbox.comment || 'Yes'}`);
  if (techReqs?.laptopInput?.enabled) specificTechLines.push(`- **Requires Laptop Input**: ${techReqs.laptopInput.comment || 'Yes'}`);
  if (techReqs?.fourChannels?.enabled) specificTechLines.push(`- **Requires 4 Channels Mixer**: ${techReqs.fourChannels.comment || 'Yes'}`);

  // Format Extras
  const selectedExtras = profile.extras.filter(e => offer.selectedExtras.includes(e.id));
  const extraLines = selectedExtras.map(e => `- ${e.name} (${e.type}): ${profile.currency} ${e.price}`);

  const prompt = `
    You are a legal assistant specializing in entertainment contracts.
    Draft a comprehensive, professional DJ Performance Contract based on the following terms.
    Output ONLY the contract text in Markdown format. Do not include conversational filler.

    **Parties:**
    - Artist (DJ): ${profile.name} (${profile.email})
    - Promoter (Client): ${offer.promoterName} (${offer.promoterEmail})

    **Event Details:**
    - Date: ${offer.eventDate}
    - Start Time: ${offer.startTime}
    - Duration: ${offer.durationHours} hours
    - Location: ${offer.location}

    **Financial Terms:**
    - Total Fee: ${profile.currency} ${totalAmount}
    - Payment Terms: 50% deposit upon signing, 50% immediately following performance.
    
    ${extraLines.length > 0 ? '**Additional Equipment & Services Provided by Artist:**' : ''}
    ${extraLines.join('\n    ')}

    **Payment Account Information:**
    - Bank: ${profile.bankDetails?.bankName || 'N/A'}
    - Account Name: ${profile.bankDetails?.accountName || 'N/A'}
    - Account Number/IBAN: ${profile.bankDetails?.accountNumber || 'N/A'}
    - Payment Reference: ${profile.bankDetails?.reference || 'N/A'}

    **Rider & Requirements:**
    - Standard Tech Rider: ${profile.techRider.map(t => t.name + (t.essential ? ' (Essential)' : '')).join(', ')}
    
    ${specificTechLines.length > 0 ? '**Specific Technical Requirements (Mandatory):**' : ''}
    ${specificTechLines.join('\n    ')}

    - Hospitality provided by Promoter: ${[
      offer.providesTransport ? 'Transport' : '',
      offer.providesAccommodation ? 'Accommodation' : '',
      offer.providesFood ? 'Food/Dinner' : '',
      offer.providesDrinks ? 'Drinks/Rider' : ''
    ].filter(Boolean).join(', ') || 'None specified'}

    **Additional Notes:**
    ${offer.additionalNotes || 'N/A'}

    **Clauses to Include:**
    1. Performance Duties
    2. Payment Schedule (Include the bank details for transfer)
    3. Cancellation Policy (Standard 30-day notice)
    4. Technical Requirements (Promoter guarantees equipment functioning and specific compatibility listed above)
    5. Equipment/Service Provision: Artist agrees to provide listed extra equipment/services. Promoter agrees to pay as part of total fee.
    6. Force Majeure
    7. Indemnification

    Format nicely with headers.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "Error generating contract. Please try again.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Failed to generate contract due to an API error. Please check your connection or API key.";
  }
};

export const enhanceBio = async (currentBio: string): Promise<string> => {
    const ai = createAIClient();
    const prompt = `Reword the following DJ biography to make it sound more professional, engaging, and suitable for a press kit. Keep it under 150 words.
    
    Current Bio: "${currentBio}"`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });
        return response.text || currentBio;
    } catch (error) {
        console.error("Gemini API Error:", error);
        return currentBio;
    }
}