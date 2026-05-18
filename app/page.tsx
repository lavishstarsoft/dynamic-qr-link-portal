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
    <div className="min-h-screen bg-[#F9F7F2] text-[#4A453E] font-sans">
      {/* HEADER - No Print */}
      <header className="no-print border-b bg-white border-[#E8E2D9] h-16 sticky top-0 z-10 px-6 sm:px-8 flex items-center justify-between">
        <div className="flex items-center space-x-2 text-[#8B9D83]">
          <div className="w-8 h-8 flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-serif italic text-[#3D3934]">QR Link Portal</h1>
        </div>
        <p className="text-sm text-[#A8A296] font-medium hidden sm:block">
          One code, multiple destinations.
        </p>
      </header>

      {/* MAIN CONTENT - No Print */}
      <main className="no-print max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* LEFT: Builder Form */}
          <div className="lg:col-span-7 space-y-8">
            <div>
              <h2 className="font-serif text-3xl mb-2 text-[#3D3934]">Create your Hub</h2>
              <p className="text-[#A8A296] text-lg">
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
                    className="p-6 bg-white rounded-3xl border border-[#E8E2D9] shadow-sm relative group"
                  >
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center w-full">
                      <div className="w-full sm:w-40 flex items-center space-x-2">
                        {getIconForType(link.type)}
                        <select
                          value={link.type}
                          onChange={(e) => updateLink(link.id, { type: e.target.value as LinkType })}
                          className="w-full bg-transparent border-none text-xs font-bold text-[#A8A296] uppercase tracking-wider focus:outline-none cursor-pointer"
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
                          className="w-full px-4 py-3 bg-[#FDFBF7] border border-[#E8E2D9] rounded-xl text-sm font-bold text-[#4A453E] focus:outline-none focus:ring-1 focus:ring-[#8B9D83]"
                          placeholder="Link Title"
                        />
                        <input
                          type="url"
                          value={link.url}
                          onChange={(e) => updateLink(link.id, { url: e.target.value })}
                          className="w-full px-4 py-3 bg-[#FDFBF7] border border-[#E8E2D9] rounded-xl text-xs text-[#4A453E] focus:outline-none focus:ring-1 focus:ring-[#8B9D83]"
                          placeholder="https://"
                        />
                        <div className="flex items-center space-x-3 pt-1">
                          <label className="cursor-pointer text-xs font-bold bg-[#E8EADF] text-[#5A6348] py-1.5 px-3 rounded-lg hover:bg-[#D8DCC8] transition-colors">
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
                className="w-full flex justify-center items-center py-4 border-2 border-dashed border-[#E8E2D9] text-[#8B9D83] font-bold rounded-3xl hover:bg-white hover:shadow-sm transition-all text-sm"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add New Field
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={handleSave}
                disabled={isSaving}
                className="w-full flex justify-center items-center py-4 bg-[#8B9D83] text-white font-bold rounded-3xl hover:bg-[#7a8a73] hover:shadow-md transition-all text-sm mt-4"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </motion.button>
            </div>
          </div>

          {/* RIGHT: QR Code Preview */}
          <div className="lg:col-span-5 flex flex-col pt-8 lg:pt-0">
            <div className="sticky top-28 bg-white p-8 rounded-3xl border border-[#E8E2D9] shadow-sm flex flex-col items-center">
              <h3 className="font-serif text-lg mb-6 text-[#5A6348]">Your Live QR Code</h3>
              
              <motion.div 
                key={qrUrl} 
                initial={{ scale: 0.9, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                ref={qrRef}
                className="w-72 h-72 bg-white p-3 border border-[#E8E2D9] rounded-2xl shadow-inner relative flex justify-center items-center mb-8"
              >
                <div className="w-full h-full border-4 border-[#4A453E] border-dashed opacity-20 absolute top-0 left-0 rounded-xl pointer-events-none"></div>
                {qrUrl && (
                  <div className="relative z-10 w-full h-full flex justify-center items-center">
                    <QRCodeSVG 
                      value={qrUrl} 
                      size={256} 
                      level="H" 
                      includeMargin={false}
                      fgColor="#4A453E" 
                    />
                  </div>
                )}
              </motion.div>

              <div className="grid grid-cols-2 gap-4 w-full">
                <button
                  onClick={handleDownload}
                  className="flex items-center justify-center px-4 py-2 bg-[#4A453E] text-white rounded-full text-sm font-medium hover:bg-[#3D3934] transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </button>
                <button
                  onClick={handlePrint}
                  className="flex items-center justify-center px-4 py-2 bg-white border border-[#E8E2D9] text-[#4A453E] rounded-full text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm"
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Print Code
                </button>
              </div>
              
              <div className="mt-6 flex flex-col space-y-3 w-full text-sm">
                <div className="bg-[#E8EADF] text-[#5A6348] p-4 rounded-xl border border-[#D8DCC8] flex items-start">
                  <Sparkles className="w-4 h-4 mr-3 flex-shrink-0 mt-0.5 opacity-80" />
                  <p className="text-xs leading-relaxed opacity-90"><strong className="block mb-1">Valid forever.</strong> This code relies completely on this app's URL. No paid subscriptions needed.</p>
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
          />
          <p className="mt-8 text-xl font-medium text-gray-700">Find us on the App Store, Play Store, and YouTube!</p>
        </div>
      )}
    </div>
  );
}
