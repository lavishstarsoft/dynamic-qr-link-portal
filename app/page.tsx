'use client';

import { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Apple, Youtube, Printer, Download, Sparkles, Plus, Trash2, Globe } from 'lucide-react';

type LinkType = 'play' | 'ios' | 'yt' | 'custom';

interface LinkField {
  id: string;
  type: LinkType;
  title: string;
  url: string;
  customImage?: string;
}

const logoBase64 = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj4KICA8cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgcng9IjE1IiBmaWxsPSIjQjkwMDRCIi8+CiAgPHRleHQgeD0iNTAiIHk9IjQ1IiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtd2VpZ2h0PSI5MDAiIGZvbnQtc2l6ZT0iMzYiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0iYWxwaGFiZXRpYyI+Tk8uMTwvdGV4dD4KICAKICA8IS0tIFBsYXkgYnV0dG9uIGFzIE8gLS0+CiAgPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTUsIDUyKSI+CiAgICA8Y2lyY2xlIGN4PSIxNSIgY3k9IjE1IiByPSIxMyIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSI0LjUiIGZpbGw9Im5vbmUiLz4KICAgIDxwYXRoIGQ9Ik0xMSA5TDIwIDE1TDExIDIxVjlaIiBmaWxsPSJ3aGl0ZSIvPgogIDwvZz4KICAKICA8dGV4dCB4PSI2OCIgeT0iODIiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC13ZWlnaHQ9IjkwMCIgZm9udC1zaXplPSIzNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJhbHBoYWJldGljIj5UVDwvdGV4dD4KPC9zdmc+";

export default function Home() {
  const [links, setLinks] = useState<LinkField[]>([]);
  const [qrUrl, setQrUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  const qrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/links')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setLinks(data);
        } else {
          setLinks([
            { id: '1', type: 'play', title: 'Play Store', url: 'https://play.google.com/store/apps' },
            { id: '2', type: 'ios', title: 'App Store', url: 'https://apps.apple.com/' },
            { id: '3', type: 'yt', title: 'YouTube', url: 'https://youtube.com/' },
          ]);
        }
      });
  }, []);

  useEffect(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    setQrUrl(`${origin}/links`);
  }, []); // The URL never changes now!

  const handleImageUpload = async (id: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.url) {
        updateLink(id, { customImage: data.url });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(links)
      });
      alert('Changes saved successfully!');
    } catch (e) {
      console.error(e);
      alert('Error saving changes');
    }
    setIsSaving(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (!qrRef.current) return;
    
    const svg = qrRef.current.querySelector('svg');
    if (!svg) return;
    
    // Convert SVG to data URI
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    
    img.onload = () => {
      // Set canvas size to scale up for high-resolution (less blurry)
      const scale = 5; 
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      
      // Draw white background
      if (ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.scale(scale, scale);
        // Draw image exactly to the edges (no padding)
        ctx.drawImage(img, 0, 0);
        
        const pngFile = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.download = "Dynamic-QRCode.png";
        downloadLink.href = `${pngFile}`;
        downloadLink.click();
      }
    };
    
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  const addLink = () => {
    setLinks([...links, { id: Date.now().toString(), type: 'custom', title: 'Website', url: '' }]);
  };

  const updateLink = (id: string, updates: Partial<LinkField>) => {
    setLinks(links.map(l => l.id === id ? { ...l, ...updates } : l));
  };

  const removeLink = (id: string) => {
    setLinks(links.filter(l => l.id !== id));
  };

  const getIconForType = (type: LinkType) => {
    switch (type) {
      case 'play': return <Play className="w-4 h-4 text-blue-500" />;
      case 'ios': return <Apple className="w-4 h-4 text-gray-500" />;
      case 'yt': return <Youtube className="w-4 h-4 text-red-500" />;
      default: return <Globe className="w-4 h-4 text-emerald-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#b00547] via-[#8f0134] to-[#600020] text-white font-sans">
      {/* HEADER - No Print */}
      <header className="no-print border-b bg-white/10 backdrop-blur-xl border-white/20 h-16 sticky top-0 z-10 px-6 sm:px-8 flex items-center justify-between">
        <div className="flex items-center space-x-2 text-white">
          <div className="flex items-center justify-center font-extrabold text-2xl leading-none tracking-tighter" style={{ fontFamily: 'Arial, sans-serif' }}>
            NO.1
            <div className="relative flex items-center justify-center ml-1 mt-0.5 text-xl">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                 <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="4.5"/>
                 <path d="M10 8.5L15 12L10 15.5V8.5Z" fill="currentColor"/>
              </svg>
              TT
            </div>
          </div>
        </div>
        <p className="text-sm text-white/70 font-medium hidden md:block">
          One code, multiple destinations.
        </p>
      </header>

      {/* MAIN CONTENT - No Print */}
      <main className="no-print max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* LEFT: Builder Form */}
          <div className="lg:col-span-7 space-y-8">
            <div>
              <h2 className="font-bold text-3xl mb-2 text-white">Create your Hub</h2>
              <p className="text-white/80 text-lg">
                Enter your destination links below. The QR code never changes. Click <b>Save Changes</b> to push updates live.
              </p>
            </div>

            <div className="space-y-4">
              <AnimatePresence>
                {links.map((link) => (
                  <motion.div
                    key={link.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                    transition={{ duration: 0.3 }}
                    className="p-6 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 shadow-sm relative group"
                  >
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center w-full">
                      <div className="w-full sm:w-40 flex items-center space-x-2 bg-black/20 p-2 rounded-xl border border-white/10">
                        {getIconForType(link.type)}
                        <select
                          value={link.type}
                          onChange={(e) => updateLink(link.id, { type: e.target.value as LinkType })}
                          className="w-full bg-transparent border-none text-xs font-bold text-white uppercase tracking-wider focus:outline-none cursor-pointer"
                        >
                          <option value="play">Play Store</option>
                          <option value="ios">App Store</option>
                          <option value="yt">YouTube</option>
                          <option value="custom">Custom Link</option>
                        </select>
                      </div>

                      <div className="flex-1 w-full space-y-2">
                        <input
                          type="text"
                          value={link.title}
                          onChange={(e) => updateLink(link.id, { title: e.target.value })}
                          className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-sm font-bold text-white placeholder-white/50 focus:outline-none focus:ring-1 focus:ring-white/30"
                          placeholder="Link Title"
                        />
                        <input
                          type="url"
                          value={link.url}
                          onChange={(e) => updateLink(link.id, { url: e.target.value })}
                          className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-xs text-white placeholder-white/50 focus:outline-none focus:ring-1 focus:ring-white/30"
                          placeholder="https://"
                        />
                        <div className="flex items-center space-x-3 pt-1">
                          <label className="cursor-pointer text-xs font-bold bg-white/20 text-white py-1.5 px-3 rounded-lg hover:bg-white/30 transition-colors">
                            {link.customImage ? 'Change Image' : 'Upload Custom Image'}
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  handleImageUpload(link.id, e.target.files[0]);
                                }
                              }} 
                            />
                          </label>
                          {link.customImage && (
                            <div className="w-8 h-8 rounded overflow-hidden flex items-center justify-center bg-gray-100 border border-gray-200">
                               <img src={link.customImage} alt="icon" className="w-full h-full object-contain" />
                            </div>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => removeLink(link.id)}
                        className="self-end sm:self-center p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors sm:opacity-0 sm:group-hover:opacity-100"
                        title="Remove link"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={addLink}
                className="w-full flex justify-center items-center py-4 border-2 border-dashed border-white/30 text-white font-bold rounded-3xl hover:bg-white/10 hover:border-white/50 transition-all text-sm"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add New Field
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={handleSave}
                disabled={isSaving}
                className="w-full flex justify-center items-center py-4 bg-white text-[#B9004B] font-bold rounded-3xl hover:bg-white/90 hover:shadow-lg transition-all text-sm mt-4 shadow-md"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </motion.button>
            </div>
          </div>

          {/* RIGHT: QR Code Preview */}
          <div className="lg:col-span-5 flex flex-col pt-8 lg:pt-0">
            <div className="sticky top-28 bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20 shadow-2xl flex flex-col items-center">
              <h3 className="font-bold text-xl mb-6 text-white text-center">NO.1 OTT QR Code</h3>
              
              <motion.div 
                key={qrUrl} 
                initial={{ scale: 0.9, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                ref={qrRef}
                className="w-72 h-72 bg-white p-3 border-2 border-white/30 rounded-2xl shadow-xl relative flex justify-center items-center mb-8"
              >
                <div className="w-full h-full border-4 border-[#B9004B] border-dashed opacity-20 absolute top-0 left-0 rounded-xl pointer-events-none"></div>
                {qrUrl && (
                  <div className="relative z-10 w-full h-full flex justify-center items-center">
                    <QRCodeSVG 
                      value={qrUrl} 
                      size={256} 
                      level="H" 
                      includeMargin={false}
                      fgColor="#B9004B"
                      imageSettings={{
                        src: logoBase64,
                        height: 60,
                        width: 60,
                        excavate: true,
                      }}
                    />
                  </div>
                )}
              </motion.div>

              <div className="grid grid-cols-2 gap-4 w-full">
                <button
                  onClick={handleDownload}
                  className="flex items-center justify-center px-4 py-2 bg-black/40 border border-white/20 text-white rounded-full text-sm font-bold hover:bg-black/60 transition-colors shadow-sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </button>
                <button
                  onClick={handlePrint}
                  className="flex items-center justify-center px-4 py-2 bg-white/20 border border-white/20 text-white rounded-full text-sm font-bold hover:bg-white/30 transition-colors shadow-sm"
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Print Code
                </button>
              </div>
              
              <div className="mt-6 flex flex-col space-y-3 w-full text-sm">
                <div className="bg-black/20 text-white p-4 rounded-xl border border-white/10 flex items-start">
                  <Sparkles className="w-4 h-4 mr-3 flex-shrink-0 mt-0.5 text-yellow-300 opacity-90" />
                  <p className="text-xs leading-relaxed opacity-90"><strong className="block mb-1 text-yellow-300">Valid forever.</strong> This code relies completely on this app's URL. No paid subscriptions needed.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* PRINT-ONLY VIEW */}
      {/* Handled by CSS Media Queries. This area will only show on print dialogues. */}
      {qrUrl && (
        <div className="hidden print-only text-center m-auto flex-col items-center justify-center w-full h-full">
          <h1 className="text-4xl font-extrabold mb-8 text-black" style={{ fontFamily: 'sans-serif' }}>Scan to connect</h1>
          <QRCodeSVG 
            value={qrUrl} 
            size={400} 
            level="H" 
            includeMargin={true}
            fgColor="#000000"
            imageSettings={{
              src: logoBase64,
              height: 80,
              width: 80,
              excavate: true,
            }}
          />
          <p className="mt-8 text-xl font-medium text-gray-700">Find us on the App Store, Play Store, and YouTube!</p>
        </div>
      )}
    </div>
  );
}
