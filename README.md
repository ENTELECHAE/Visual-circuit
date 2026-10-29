# Visual Circuit Studio

> High-fidelity, browser-native 3D circuit simulation, electronic breadboarding, and AI-assisted firmware synthesis platform. Designed with a minimal, dark monochromatic aesthetic.

---

## ⚡ Highlights

- **3D Circuit Studio:** Real-time Three.js / WebGL physical simulation environment with dynamic OrbitControls, collision detection, snap-to-grid placement, and interactive pin-to-pin wiring.
- **Visual Component Catalog:** 2-column visual grid drawer and dense list views featuring vector previews for:
  - Microcontrollers: Arduino Uno R3, Arduino Mega 2560, ESP32
  - Prototyping: Half-size (30-row) & Full-size (63-row) solderless breadboards
  - Passives & Actuators: 5mm polycarbonate LEDs (Red, Green, Blue, Yellow, RGB), Resistors (with 4-band color coding), SG90 Micro Servos, Piezo Buzzers
  - Sensors & Displays: HC-SR04 Ultrasonic Distance Sensors, LDR Photoresistors, 1602 LCD Displays, 5V Relays, Pushbuttons, Potentiometers, Slide Switches
- **Real-Time Physics & Electrical Engine:**
  - Dynamic node-voltage electrical graph solver (`circuitGraph.ts`)
  - Bidirectional conduction across passives, diodes, and mechanical switches
  - Live LED illumination, servo rotation, and pin status monitoring
- **AI Circuit Copilot:**
  - Natural language prompt-to-schematic synthesis and firmware generation
  - Secure token handling via Vite environment configuration and masked client display
- **Monaco Code Editor & Virtual Serial Terminal:**
  - In-browser Arduino C++ code editing, syntax highlighting, and virtual COM port debugging.

---

## 🛠️ Tech Stack

- **Frontend:** React 19, TypeScript 5.7, Vite 6
- **3D Graphics:** Three.js, React Three Fiber, Drei, OrbitControls
- **Styling:** Tailwind CSS, PostCSS, Lucide Icons
- **Code & Terminal:** Monaco Editor (`@monaco-editor/react`), Xterm.js (`@xterm/xterm`)
- **Simulation:** Custom electrical graph netlist solver

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18.0.0 or higher recommended)
- npm or pnpm

### 1. Clone the repository
```bash
git clone https://github.com/ENTELECHAE/Visual-circuit.git
cd Visual-circuit
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup environment variables
Copy the example environment configuration:
```bash
cp .env.example .env
```
Populate `.env` with your API credentials (optional for offline 3D modeling and manual simulation):
```env
VITE_AI_API_KEY=your_api_key_here
VITE_AI_BASE_URL=https://larprouter.com/v1
```

### 4. Run development server
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.

### 5. Build for production
```bash
npm run build
```
The optimized production bundle will be generated in `dist/`.

---

## 🔒 Security

- Sensitive credentials and API keys are strictly excluded from git tracking via `.gitignore`.
- In the client UI, keys are encrypted in-memory and masked from all user-facing inputs and logs.
- Never commit `.env` or production credentials to source control.

---

## 📂 Project Architecture

```
Visual-circuit/
├── src/
│   ├── components/
│   │   ├── Breadboard/       # 2D schematic & breadboard canvas
│   │   ├── Builder/          # AI prompt copilot & schematic synthesizer
│   │   ├── CodeEditor/       # Monaco Arduino C++ IDE
│   │   ├── RightPanel/       # Inspector, BOM, & serial monitor
│   │   ├── Sidebar/          # Visual parts drawer & SVG vector previews
│   │   ├── Titlebar/         # Minimalist top nav & simulation triggers
│   │   └── View3D/           # Three.js 3D viewport, shaders, models, wires
│   ├── simulation/           # Electrical netlist graph solver & AVR engine
│   ├── store/                # Global circuit & simulation state
│   ├── services/             # AI service & API client
│   └── styles/               # Pitch dark minimalist design tokens
├── .env.example              # Environment configuration template
├── .gitignore                # Production ignore rules
├── package.json              # Project dependencies & scripts
├── tsconfig.json             # TypeScript configuration
└── vite.config.ts            # Vite bundler & vendor chunking rules
```

---

## 📄 License

Proprietary © [ENTELECHAE](https://github.com/ENTELECHAE). All rights reserved.
