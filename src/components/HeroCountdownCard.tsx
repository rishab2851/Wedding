import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Heart, Sparkles, Clock, Edit3 } from 'lucide-react';
import { WeddingSettings } from '../types';

interface HeroCountdownCardProps {
  settings: WeddingSettings;
  onOpenSettings?: () => void;
}

export const HeroCountdownCard: React.FC<HeroCountdownCardProps> = ({
  settings,
  onOpenSettings,
}) => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isPast: boolean;
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isPast: false,
  });

  useEffect(() => {
    const calculateTime = () => {
      const target = new Date(`${settings.weddingDate}T${settings.weddingTime || '18:00'}:00`).getTime();
      const now = new Date().getTime();
      const difference = target - now;

      if (isNaN(target)) {
        return;
      }

      if (difference <= 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isPast: true,
        });
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);
        setTimeLeft({ days, hours, minutes, seconds, isPast: false });
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [settings.weddingDate, settings.weddingTime]);

  const formattedDate = new Date(settings.weddingDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div
      id="hero-countdown-card"
      className="relative overflow-hidden rounded-3xl shadow-xl text-white my-4 border border-[#E8D7C3]/40"
      style={{
        minHeight: '260px',
      }}
    >
      {/* Romantic Background Image with Multi-layer Gradient Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 hover:scale-105"
        style={{
          backgroundImage: `url('${
            settings.heroImageUrl ||
            'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=2000&q=80'
          }')`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#2A1713]/95 via-[#4A261F]/70 to-[#1F0F0C]/50" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-200/20 via-transparent to-transparent" />

      {/* Content Container */}
      <div className="relative z-10 p-6 md:p-8 flex flex-col justify-between h-full min-h-[260px]">
        {/* Top bar with decorative badge and edit button */}
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-black/30 backdrop-blur-md border border-[#E8D7C3]/30 text-xs tracking-wider uppercase font-medium text-[#F3E5D8]">
            <Sparkles className="w-3.5 h-3.5 text-[#E6C387]" />
            <span>The Royal Celebration</span>
          </div>

          {onOpenSettings && (
            <button
              id="hero-edit-settings-btn"
              onClick={onOpenSettings}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md text-xs font-medium text-white/90 transition-colors border border-white/20"
              title="Edit Wedding Date & Couple Names"
            >
              <Edit3 className="w-3 h-3 text-[#E6C387]" />
              <span>Edit Date</span>
            </button>
          )}
        </div>

        {/* Center: Couple Names in Luxury Serif */}
        <div className="text-center my-3">
          <p className="text-xs uppercase tracking-[0.25em] text-[#EAD0B3] font-light mb-1">
            Celebrating the Union of
          </p>
          <h1 className="font-cormorant text-3xl sm:text-4xl md:text-5xl font-semibold tracking-wide text-[#FFF8F0] drop-shadow-md">
            {settings.coupleNames || 'The Happy Couple'}
          </h1>
          <div className="flex items-center justify-center gap-2 mt-2 text-xs text-[#EAD0B3]/90 font-light">
            <Calendar className="w-3.5 h-3.5 text-[#E6C387]" />
            <span>{formattedDate}</span>
            {settings.venueCity && (
              <>
                <span className="text-white/40">•</span>
                <MapPin className="w-3.5 h-3.5 text-[#E6C387]" />
                <span>{settings.venueCity}</span>
              </>
            )}
          </div>
        </div>

        {/* Bottom: Countdown Counters */}
        <div className="bg-black/35 backdrop-blur-md rounded-2xl p-3 sm:p-4 border border-[#E8D7C3]/20 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-left">
            <div className="w-9 h-9 rounded-full bg-[#9E2A2B]/40 border border-[#E6C387]/40 flex items-center justify-center text-[#E6C387]">
              <Heart className="w-4 h-4 fill-current animate-pulse" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-[#EAD0B3] font-medium">
                Wedding Countdown
              </div>
              <div className="text-sm font-semibold text-white">
                {timeLeft.isPast
                  ? 'Happily Ever After Begins!'
                  : `${timeLeft.days} Days to Go!`}
              </div>
            </div>
          </div>

          {/* Time Units Grid */}
          {!timeLeft.isPast ? (
            <div className="grid grid-cols-4 gap-2 text-center w-full sm:w-auto">
              <div className="px-2.5 py-1.5 rounded-xl bg-white/10 backdrop-blur-sm min-w-[54px] border border-white/10">
                <span className="block font-cormorant text-xl font-bold text-[#FFF2DE] leading-tight">
                  {timeLeft.days}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-[#E2C7A7]">
                  Days
                </span>
              </div>
              <div className="px-2.5 py-1.5 rounded-xl bg-white/10 backdrop-blur-sm min-w-[54px] border border-white/10">
                <span className="block font-cormorant text-xl font-bold text-[#FFF2DE] leading-tight">
                  {timeLeft.hours}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-[#E2C7A7]">
                  Hours
                </span>
              </div>
              <div className="px-2.5 py-1.5 rounded-xl bg-white/10 backdrop-blur-sm min-w-[54px] border border-white/10">
                <span className="block font-cormorant text-xl font-bold text-[#FFF2DE] leading-tight">
                  {timeLeft.minutes}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-[#E2C7A7]">
                  Mins
                </span>
              </div>
              <div className="px-2.5 py-1.5 rounded-xl bg-white/10 backdrop-blur-sm min-w-[54px] border border-white/10">
                <span className="block font-cormorant text-xl font-bold text-[#FFF2DE] leading-tight">
                  {timeLeft.seconds}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-[#E2C7A7]">
                  Secs
                </span>
              </div>
            </div>
          ) : (
            <div className="text-xs px-3 py-1.5 rounded-lg bg-emerald-900/50 border border-emerald-500/30 text-emerald-200">
              Celebration Completed / Ongoing
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
