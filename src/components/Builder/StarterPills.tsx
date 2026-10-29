import React from 'react';
import { Lightbulb, Navigation, Disc, Cpu, Activity } from 'lucide-react';

interface StarterPillsProps {
  onSelectPrompt: (prompt: string, presetId?: string) => void;
}

export const StarterPills: React.FC<StarterPillsProps> = ({ onSelectPrompt }) => {
  const starters = [
    {
      id: 'blink',
      title: 'Blink an LED',
      desc: 'The classic Arduino "Hello, world."',
      prompt: 'Make an LED blink on and off once per second using an Arduino Uno on a half-size breadboard.',
      presetId: 'uno-blink',
      icon: Lightbulb,
      color: '#f5a623',
    },
    {
      id: 'traffic',
      title: 'Build a traffic light',
      desc: 'Red, yellow, green — just like the real thing.',
      prompt: 'Build a traffic light with red, yellow, and green LEDs that cycle like a real signal — 2 seconds per color. Use an Arduino Uno on a full-size breadboard.',
      presetId: 'uno-button',
      icon: Activity,
      color: '#e53935',
    },
    {
      id: 'servo',
      title: 'Sweep a servo',
      desc: 'Watch a servo arm rotate 180° and back.',
      prompt: 'Sweep a servo motor smoothly from 0° to 180° and back, in 1° steps with a 15ms delay. Use an Arduino Uno.',
      presetId: 'uno-servo',
      icon: Navigation,
      color: '#58a6ff',
    },
    {
      id: 'ultrasonic',
      title: 'Distance radar',
      desc: 'Measure distance in cm with HC-SR04 sound pulses.',
      prompt: 'Measure distance using an HC-SR04 ultrasonic sensor and print distance in centimeters to the Serial Monitor every 200ms.',
      presetId: 'uno-ultrasonic',
      icon: Disc,
      color: '#3ecf8e',
    },
  ];

  return (
    <div className="chat-starter-pills-row">
      {starters.map((s) => {
        const IconComponent = s.icon;
        return (
          <button
            key={s.id}
            type="button"
            className={`chat-starter-pill chat-starter-pill--${s.id}`}
            onClick={() => onSelectPrompt(s.prompt, s.presetId)}
            title={s.desc}
          >
            <span className="chat-starter-pill__icon" style={{ color: s.color }}>
              <IconComponent size={14} />
            </span>
            <span>{s.title}</span>
          </button>
        );
      })}
    </div>
  );
};

