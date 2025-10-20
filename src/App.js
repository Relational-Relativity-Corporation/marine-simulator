import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Waves, Thermometer, Droplets, Gauge, Sun } from 'lucide-react';

const MarineSimulator = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  
  const [depth, setDepth] = useState(50);
  const [currentSpeed, setCurrentSpeed] = useState(0.5);
  const [temperature, setTemperature] = useState(15);
  const [salinity, setSalinity] = useState(35);
  const [turbidity, setTurbidity] = useState(0.3);
  
  const [sensorData, setSensorData] = useState([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [time, setTime] = useState(0);
  
  const [pressure, setPressure] = useState(0);
  const [lightLevel, setLightLevel] = useState(0);
  const [sonarReading, setSonarReading] = useState(0);
  const [flowRate, setFlowRate] = useState(0);
  
  const particles = useRef([]);
  const numParticles = 150;
  
  useEffect(() => {
    particles.current = Array.from({ length: numParticles }, () => ({
      x: Math.random() * 800,
      y: Math.random() * 600,
      vx: (Math.random() - 0.5) * currentSpeed,
      vy: (Math.random() - 0.5) * currentSpeed * 0.3,
      size: Math.random() * 2 + 1,
      opacity: Math.random() * 0.5 + 0.3
    }));
  }, []);
  
  useEffect(() => {
    const calcPressure = (depth * 0.1 + 1).toFixed(2);
    setPressure(calcPressure);
    
    const calcLight = Math.max(0, 100 * Math.exp(-0.05 * depth - turbidity * 2));
    setLightLevel(calcLight.toFixed(1));
    
    const seafloorDepth = 200;
    const calcSonar = Math.max(0, seafloorDepth - depth + Math.sin(time * 0.1) * 5);
    setSonarReading(calcSonar.toFixed(1));
    
    const calcFlow = (currentSpeed * (1 + depth / 100) * 100).toFixed(1);
    setFlowRate(calcFlow);
  }, [depth, currentSpeed, turbidity, time]);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 600;
    
    const animate = () => {
      if (!isSimulating) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }
      
      setTime(t => t + 0.016);
      
      const gradient = ctx.createLinearGradient(0, 0, 0, 600);
      const depthFactor = Math.min(depth / 100, 1);
      gradient.addColorStop(0, `rgba(0, ${100 - depthFactor * 80}, ${180 - depthFactor * 100}, 0.95)`);
      gradient.addColorStop(1, `rgba(0, ${50 - depthFactor * 40}, ${100 - depthFactor * 80}, 0.95)`);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 800, 600);
      
      particles.current.forEach(p => {
        p.x += p.vx * currentSpeed * 2;
        p.y += p.vy * currentSpeed * 2;
        p.x += Math.sin(time * 2 + p.y * 0.01) * 0.5;
        p.y += Math.cos(time * 2 + p.x * 0.01) * 0.3;
        
        if (p.x < 0) p.x = 800;
        if (p.x > 800) p.x = 0;
        if (p.y < 0) p.y = 600;
        if (p.y > 600) p.y = 0;
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity * (1 - turbidity)})`;
        ctx.fill();
      });
      
      const rovX = 400 + Math.sin(time * 0.5) * 100;
      const rovY = 300 + Math.cos(time * 0.3) * 50;
      
      ctx.fillStyle = 'rgba(255, 200, 0, 0.9)';
      ctx.fillRect(rovX - 20, rovY - 10, 40, 20);
      ctx.fillStyle = 'rgba(200, 150, 0, 0.9)';
      ctx.fillRect(rovX - 15, rovY - 5, 30, 10);
      
      ctx.strokeStyle = 'rgba(150, 150, 150, 0.7)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(rovX - 25, rovY, 5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(rovX + 25, rovY, 5, 0, Math.PI * 2);
      ctx.stroke();
      
      ctx.strokeStyle = `rgba(0, 255, 0, ${0.3 * Math.sin(time * 3)})`;
      ctx.lineWidth = 2;
      for (let i = 1; i <= 3; i++) {
        ctx.beginPath();
        ctx.arc(rovX, rovY + 10, i * 15 + (time * 20) % 15, 0, Math.PI * 2);
        ctx.stroke();
      }
      
      if (lightLevel > 10) {
        const lightGradient = ctx.createLinearGradient(rovX, rovY, rovX, rovY + 100);
        lightGradient.addColorStop(0, `rgba(255, 255, 200, ${lightLevel / 300})`);
        lightGradient.addColorStop(1, 'rgba(255, 255, 200, 0)');
        ctx.fillStyle = lightGradient;
        ctx.fillRect(rovX - 30, rovY, 60, 100);
      }
      
      ctx.strokeStyle = 'rgba(255, 100, 100, 0.2)';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      for (let i = 0; i < 5; i++) {
        const y = i * 120;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(800, y);
        ctx.stroke();
      }
      ctx.setLineDash([]);
      
      ctx.fillStyle = 'rgba(139, 90, 43, 0.6)';
      const seafloorY = 550;
      ctx.beginPath();
      ctx.moveTo(0, seafloorY);
      for (let x = 0; x <= 800; x += 20) {
        ctx.lineTo(x, seafloorY + Math.sin(x * 0.05 + time) * 5);
      }
      ctx.lineTo(800, 600);
      ctx.lineTo(0, 600);
      ctx.closePath();
      ctx.fill();
      
      if (Math.floor(time * 10) % 5 === 0) {
        setSensorData(prev => {
          const newData = [...prev, {
            time: time.toFixed(1),
            temp: (temperature - depth * 0.05 + Math.random() * 2).toFixed(1),
            pressure: parseFloat(pressure),
            light: parseFloat(lightLevel),
            current: (currentSpeed * 100 + Math.random() * 10).toFixed(1)
          }];
          return newData.slice(-20);
        });
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isSimulating, depth, currentSpeed, temperature, turbidity, time, pressure, lightLevel]);
  
  return (
    <div className="w-full min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Marine Environment Testing Simulator</h1>
        <p className="text-slate-400 mb-6">Interactive simulation platform for underwater testing and data collection</p>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 bg-slate-800 rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">3D Environment View</h2>
              <button
                onClick={() => setIsSimulating(!isSimulating)}
                className={`px-6 py-2 rounded-lg font-semibold transition-colors ${isSimulating ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
              >
                {isSimulating ? 'Pause Simulation' : 'Start Simulation'}
              </button>
            </div>
            <canvas ref={canvasRef} className="w-full border-2 border-slate-600 rounded" style={{ maxHeight: '600px' }} />
            <div className="mt-4 text-sm text-slate-400">
              <p>• Yellow object: Autonomous underwater vehicle (ROV) with active sensors</p>
              <p>• White particles: Water current flow visualization</p>
              <p>• Green pulses: Active sonar scanning</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="bg-slate-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4">Environmental Controls</h3>
              <div className="space-y-4">
                <div>
                  <label className="flex items-center text-sm mb-2">
                    <Gauge className="w-4 h-4 mr-2" />Depth: {depth}m
                  </label>
                  <input type="range" min="5" max="200" value={depth} onChange={(e) => setDepth(Number(e.target.value))} className="w-full" />
                </div>
                <div>
                  <label className="flex items-center text-sm mb-2">
                    <Waves className="w-4 h-4 mr-2" />Current Speed: {currentSpeed.toFixed(1)} m/s
                  </label>
                  <input type="range" min="0" max="2" step="0.1" value={currentSpeed} onChange={(e) => setCurrentSpeed(Number(e.target.value))} className="w-full" />
                </div>
                <div>
                  <label className="flex items-center text-sm mb-2">
                    <Thermometer className="w-4 h-4 mr-2" />Surface Temp: {temperature}°C
                  </label>
                  <input type="range" min="0" max="30" value={temperature} onChange={(e) => setTemperature(Number(e.target.value))} className="w-full" />
                </div>
                <div>
                  <label className="flex items-center text-sm mb-2">
                    <Droplets className="w-4 h-4 mr-2" />Salinity: {salinity} PSU
                  </label>
                  <input type="range" min="0" max="40" value={salinity} onChange={(e) => setSalinity(Number(e.target.value))} className="w-full" />
                </div>
                <div>
                  <label className="flex items-center text-sm mb-2">
                    <Sun className="w-4 h-4 mr-2" />Turbidity: {turbidity.toFixed(1)} NTU
                  </label>
                  <input type="range" min="0" max="1" step="0.1" value={turbidity} onChange={(e) => setTurbidity(Number(e.target.value))} className="w-full" />
                </div>
              </div>
            </div>
            
            <div className="bg-slate-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4">Live Sensor Data</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Pressure:</span>
                  <span className="font-mono text-blue-400">{pressure} bar</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Light Level:</span>
                  <span className="font-mono text-yellow-400">{lightLevel}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Sonar Distance:</span>
                  <span className="font-mono text-green-400">{sonarReading}m</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Flow Rate:</span>
                  <span className="font-mono text-cyan-400">{flowRate} L/s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Actual Temp:</span>
                  <span className="font-mono text-red-400">{(temperature - depth * 0.05).toFixed(1)}°C</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">Historical Data Trends</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={sensorData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="time" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
              <Legend />
              <Line type="monotone" dataKey="temp" stroke="#ef4444" name="Temperature" dot={false} />
              <Line type="monotone" dataKey="pressure" stroke="#3b82f6" name="Pressure" dot={false} />
              <Line type="monotone" dataKey="light" stroke="#eab308" name="Light" dot={false} />
              <Line type="monotone" dataKey="current" stroke="#06b6d4" name="Current" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default MarineSimulator;
