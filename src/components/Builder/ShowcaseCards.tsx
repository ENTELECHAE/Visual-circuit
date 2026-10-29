import React from 'react';
import { ArrowRight, Cpu, Radio, Gauge, Music } from 'lucide-react';
import { circuitStore } from '../../store/circuitStore';

interface ShowcaseCardsProps {
  onOpenProject: (presetId: string) => void;
}

export const ShowcaseCards: React.FC<ShowcaseCardsProps> = ({ onOpenProject }) => {
  const templates = [
    {
      id: 'uno-blink',
      title: 'LED Strobe & PWM Fade',
      desc: 'Digital pin modulation with current-limiting 220Ω resistor protection.',
      tone: 'sky',
      icon: Cpu,
      badge: 'Beginner',
    },
    {
      id: 'uno-potentiometer',
      title: 'Analog Potentiometer & Dial',
      desc: 'Continuous voltage divider read via ADC pin A0 driving PWM output.',
      tone: 'butter',
      icon: Gauge,
      badge: 'Analog',
    },
    {
      id: 'uno-ultrasonic',
      title: 'Sonar Rangefinder Alarm',
      desc: 'High-speed speed-of-sound time-of-flight echo reflection detection.',
      tone: 'mint',
      icon: Radio,
      badge: 'Sensor',
    },
    {
      id: 'uno-servo',
      title: 'PWM Robotic Servo Actuator',
      desc: 'Microsecond pulse position modulation controlling 180° mechanical sweep.',
      tone: 'coral',
      icon: Music,
      badge: 'Robotics',
    },
  ];

  return (
    <section className="chat-showcase" aria-labelledby="chat-showcase-title">
      <header className="chat-showcase__head">
        <h2 id="chat-showcase-title" className="chat-showcase__title">
          Discover templates
        </h2>
        <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
          4 verified hardware circuits
        </span>
      </header>

      <div className="chat-showcase__rail">
        {templates.map((card) => {
          const IconComp = card.icon;
          return (
            <article
              key={card.id}
              role="button"
              tabIndex={0}
              className={`showcase-project-card showcase-project-card--${card.tone}`}
              onClick={() => {
                circuitStore.loadPreset(card.id);
                onOpenProject(card.id);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  circuitStore.loadPreset(card.id);
                  onOpenProject(card.id);
                }
              }}
              title={card.title}
            >
              <div className="showcase-project-card__visual" aria-hidden="true">
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '10px',
                  background: 'rgba(0,0,0,0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}>
                  <IconComp size={24} style={{ color: 'var(--text-white)' }} />
                </div>
                <div style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  fontSize: '9.5px',
                  fontFamily: 'var(--font-mono)',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  background: 'rgba(0,0,0,0.4)',
                  color: 'var(--text-primary)',
                  fontWeight: 600,
                  textTransform: 'uppercase'
                }}>
                  {card.badge}
                </div>
              </div>

              <div className="showcase-project-card__body">
                <h3 className="showcase-project-card__title">{card.title}</h3>
                <p className="showcase-project-card__desc">{card.desc}</p>
                <div className="showcase-project-card__arrow">
                  <span>Explore template</span>
                  <ArrowRight size={12} />
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};

