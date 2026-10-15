import React, { useState } from 'react';
import { UserCheck, Check, Send, Sparkles, Heart, Music, Phone } from 'lucide-react';
import { RsvpEntry, EventDetails } from '../types';
import { musicPlayer } from '../utils/audioPlayer';
import { triggerRsvpConfetti } from '../utils/confettiCelebration';

interface RsvpSectionProps {
  details: EventDetails;
  onNewRsvp: (entry: RsvpEntry) => void;
}

export const RsvpSection: React.FC<RsvpSectionProps> = ({ details, onNewRsvp }) => {
  const [fullName, setFullName] = useState('');
  const [guestsCount, setGuestsCount] = useState<number>(1);
  const [phone, setPhone] = useState('');
  const [songSuggestion, setSongSuggestion] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const newEntry: RsvpEntry = {
        id: `rsvp-${Date.now()}`,
        fullName: fullName.trim(),
        attending: true,
        guestsCount: Number(guestsCount) || 1,
        dietPreference: 'none',
        phone: phone.trim() || undefined,
        songSuggestion: songSuggestion.trim() || undefined,
        message: message.trim() || undefined,
        submittedAt: new Date().toISOString(),
      };

      onNewRsvp(newEntry);

      // Automatic sync to Google Sheets Web App endpoint
      const googleSheetUrl =
        'https://script.google.com/macros/s/AKfycbyY0WbYlieOuoJhp66Zg-UF6YpOeg09R_PYp0A7Xxa5ag8RDSdxEeSkPI29fqQq2hF-kg/exec';

      try {
        const formData = new URLSearchParams();
        const fechaUruguay = new Date().toLocaleString('es-UY', {
          timeZone: 'America/Montevideo',
        });

        formData.append('fecha', fechaUruguay);
        formData.append('nombre', newEntry.fullName);
        formData.append('personas', String(newEntry.guestsCount));
        formData.append('telefono', newEntry.phone || '-');
        formData.append('cancion', newEntry.songSuggestion || '-');
        formData.append('mensaje', newEntry.message || '-');
        // Extra compatibility fields in case Google Script looks for specific column names
        formData.append('name', newEntry.fullName);
        formData.append('guests', String(newEntry.guestsCount));
        formData.append('phone', newEntry.phone || '-');
        formData.append('song', newEntry.songSuggestion || '-');
        formData.append('message', newEntry.message || '-');

        fetch(googleSheetUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: formData.toString(),
        }).catch((err) => console.log('Sheet sync notice:', err));
      } catch (e) {
        // handled gracefully
      }

      setIsSubmitting(false);
      setIsSubmitted(true);

      // Play sound and celebration confetti
      musicPlayer.playCelebrationChime();
      triggerRsvpConfetti();
    }, 500);
  };

  return (
    <section id="confirmacion" className="py-16 sm:py-20 px-4 bg-white relative overflow-hidden">
      <div className="max-w-2xl mx-auto text-center relative z-10 flex flex-col items-center">
        {/* Animated icon (monolínea rounded) */}
        <div className="inline-flex items-center justify-center text-[#0833A2] mb-4 select-none animate-crown">
          <UserCheck className="w-9 h-9 sm:w-10 sm:h-10" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        </div>

        {/* Heading: Confirma tu lugar */}
        <h3
          className="text-2xl sm:text-3xl font-normal text-[#061D60] tracking-wide mb-4"
          style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}
        >
          Confirma tu lugar
        </h3>

        {/* Paragraph */}
        <p
          className="text-gray-600 text-sm sm:text-base max-w-lg mx-auto leading-relaxed mb-8 font-light"
          style={{ fontFamily: 'Montserrat, sans-serif' }}
        >
          Por favor, dejanos saber si vas a poder acompañarnos para coordinar el catering y la distribución de mesas.
        </p>

        {/* The Card Container */}
        <div className="w-full max-w-xl mx-auto bg-[#F3F5F9] rounded-3xl p-6 sm:p-9 border border-[#C7CCD5]/60 shadow-md text-left">
          {isSubmitted ? (
            <div className="text-center py-8 space-y-4 animate-in fade-in zoom-in-95 duration-300">
              <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-xs">
                <Check className="w-8 h-8" strokeWidth={2} />
              </div>

              <h4
                className="text-xl sm:text-2xl font-bold text-[#061D60]"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                ¡Muchas gracias por confirmar!
              </h4>

              <p className="text-gray-600 text-sm leading-relaxed max-w-md mx-auto">
                Tu lugar ha sido reservado exitosamente. ¡Nos vemos en el salón para festejar a lo grande con {details.celebrantName}!
              </p>

              {/* Celebratory interactive confetti button */}
              <div className="py-2">
                <button
                  type="button"
                  onClick={() => {
                    musicPlayer.playCelebrationChime();
                    triggerRsvpConfetti();
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0833A2] hover:bg-[#061D60] text-white font-semibold text-xs tracking-wider uppercase rounded-full shadow-md active:scale-95 transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                  <span>¡Lanzar confeti! 🎊</span>
                </button>
              </div>

              {/* Actions after submit (WhatsApp button removed as requested) */}
              <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setFullName('');
                    setGuestsCount(1);
                    setPhone('');
                    setSongSuggestion('');
                    setMessage('');
                    setIsSubmitted(false);
                  }}
                  className="px-5 py-2.5 text-xs text-[#0833A2] hover:text-[#061D60] font-medium bg-white rounded-xl border border-[#C7CCD5]/60 hover:border-[#0833A2]/40 transition-all cursor-pointer shadow-xs"
                >
                  Confirmar otra persona o editar
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#061D60] mb-1.5">
                  Nombre y Apellido *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Florencia Pérez"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 bg-white text-sm rounded-xl border border-[#C7CCD5] focus:outline-none focus:border-[#0833A2] focus:ring-2 focus:ring-[#0833A2]/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Guests Count */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#061D60] mb-1.5">
                    Cantidad de Personas
                  </label>
                  <select
                    value={guestsCount}
                    onChange={(e) => setGuestsCount(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-white text-sm rounded-xl border border-[#C7CCD5] focus:outline-none focus:border-[#0833A2] focus:ring-2 focus:ring-[#0833A2]/20 cursor-pointer"
                  >
                    <option value={1}>1 persona (solo yo)</option>
                    <option value={2}>2 personas</option>
                    <option value={3}>3 personas</option>
                    <option value={4}>4 personas</option>
                    <option value={5}>5 personas o más</option>
                  </select>
                </div>

                {/* WhatsApp */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#061D60] mb-1.5">
                    Teléfono / WhatsApp
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                    <input
                      type="tel"
                      placeholder="Ej: 099 123 456"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white text-sm rounded-xl border border-[#C7CCD5] focus:outline-none focus:border-[#0833A2] focus:ring-2 focus:ring-[#0833A2]/20"
                    />
                  </div>
                </div>
              </div>

              {/* Song Request */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#061D60] mb-1.5 flex items-center gap-1.5">
                  <Music className="w-3.5 h-3.5 text-[#0833A2]" />
                  <span>¿Qué canción no puede faltar en la fiesta?</span>
                </label>
                <input
                  type="text"
                  placeholder="Canción y artista que querés escuchar"
                  value={songSuggestion}
                  onChange={(e) => setSongSuggestion(e.target.value)}
                  className="w-full px-4 py-3 bg-white text-sm rounded-xl border border-[#C7CCD5] focus:outline-none focus:border-[#0833A2] focus:ring-2 focus:ring-[#0833A2]/20"
                />
              </div>

              {/* Message to Celebrant */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#061D60] mb-1.5 flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-[#0833A2]" />
                  <span>Mensaje o Dedicatoria para {details.celebrantName}</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="Escribile unas palabras que guardará con mucho cariño..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white text-sm rounded-xl border border-[#C7CCD5] focus:outline-none focus:border-[#0833A2] focus:ring-2 focus:ring-[#0833A2]/20 resize-none"
                />
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-[#0833A2] hover:bg-[#061D60] active:scale-98 text-white font-semibold text-sm rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'Confirmando...' : 'Confirmar Asistencia'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};
