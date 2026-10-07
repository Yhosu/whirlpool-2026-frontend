import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  Upload,
  User,
  Phone,
  CreditCard,
  Building2,
  AlertCircle,
  FileCheck,
  RotateCw,
  ImageIcon,
} from 'lucide-react';
import { httpService } from '../services/httpService';
import { Machine } from '../components/machine/Machine';
import { LegalBar } from '../components/sections/LegalBar';
import { Footer } from '../components/sections/Footer';
import { optimizeImageFile, OptimizedImageResult } from '../utils/imageOptimizer';
import { playClickSound } from '../utils/sound';

// Assets
import texturaFondoImg from '../assets/textura-fondo.png';
import tituloImg from '../assets/titulo.png';

const BOLIVIA_CITIES = [
  'Santa Cruz',
  'La Paz',
  'Cochabamba',
  'El Alto',
  'Sucre',
  'Tarija',
];

export const OtroDistribuidorPage: React.FC = () => {
  // Always reset scroll to the top when navigating to this page
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  // Form fields as requested by API contract
  const [name, setName] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [cellphone, setCellphone] = useState('');
  const [city, setCity] = useState('Santa Cruz');

  // File state & optimization
  const [fileBase64, setFileBase64] = useState<string>('');
  const [fileName, setFileName] = useState('');
  const [optimizingFile, setOptimizingFile] = useState(false);
  const [fileOptimizationInfo, setFileOptimizationInfo] = useState<OptimizedImageResult | null>(null);

  // Status state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [assignedCode, setAssignedCode] = useState('');

  // Handle file upload with client-side compression
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFileName(selected.name);
      setOptimizingFile(true);
      setErrorMessage('');

      try {
        // Optimize and compress image (resizes to max 1600px, quality 0.82)
        const optimized = await optimizeImageFile(selected, 1600, 0.82);
        setFileBase64(optimized.base64);
        setFileOptimizationInfo(optimized);
      } catch (err) {
        console.error('Error optimizando archivo:', err);
        // Fallback: read directly as base64
        const reader = new FileReader();
        reader.onload = () => {
          setFileBase64(reader.result as string);
        };
        reader.readAsDataURL(selected);
      } finally {
        setOptimizingFile(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || optimizingFile) return;

    if (!name.trim()) {
      setErrorMessage('Ingresa tu nombre completo.');
      return;
    }
    if (documentNumber.trim().length < 5) {
      setErrorMessage('Ingresa tu número de carnet de identidad.');
      return;
    }
    if (cellphone.trim().length < 7) {
      setErrorMessage('Ingresa tu número de celular.');
      return;
    }
    if (!fileBase64) {
      setErrorMessage('Por favor adjunta la foto o captura de tu factura o nota de venta.');
      return;
    }

    playClickSound();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const response = await httpService.otroDistribuidor.submitRegistration({
        name: name.trim(),
        document_number: documentNumber.trim(),
        cellphone: cellphone.trim(),
        city,
        file: fileBase64,
        fileName,
        fileSizeKb: fileOptimizationInfo?.compressedSizeKb,
      });

      if (response.success) {
        if (response.data?.code) {
          setAssignedCode(response.data.code);
        }
        setSubmitSuccess(true);
      } else {
        setErrorMessage(response.message || 'Error al enviar el formulario.');
      }
    } catch {
      setErrorMessage('Error de conexión al enviar el registro. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    playClickSound();
    setSubmitSuccess(false);
    setAssignedCode('');
    setName('');
    setDocumentNumber('');
    setCellphone('');
    setCity('Santa Cruz');
    setFileBase64('');
    setFileName('');
    setFileOptimizationInfo(null);
    setErrorMessage('');
  };

  // 26 radial sunburst rays for background
  const rays = Array.from({ length: 26 });

  return (
    <div className="relative min-h-screen bg-[#FFFBF0] text-[#101010] flex flex-col justify-between select-none">
      {/* ================= FLOATING ACTION CONTROL (IDENTICO A /girar) ================= */}
      <Link
        to="/"
        onClick={() => {
          window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        }}
        aria-label="Volver"
        className="fixed sm:absolute top-3 sm:top-5 left-3 sm:left-6 z-40 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#101010]/85 hover:bg-[#FDC32B] text-white hover:text-[#101010] shadow-[0_6px_20px_rgba(0,0,0,0.25)] backdrop-blur-md border border-white/10 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
      >
        <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
      </Link>

      {/* ================= HERO CONTENT: FULL WIDTH TWO-COLUMN STRIPES ================= */}
      <main className="relative flex-1 hero-radial-bg overflow-hidden pt-4 pb-0 w-full flex flex-col justify-between">
        {/* Sunburst background rays */}
        <div className="absolute inset-0 pointer-events-none opacity-30 z-0">
          {rays.map((_, i) => (
            <span
              key={i}
              className="absolute left-1/2 top-[10%] w-[3px] h-[240vh] origin-top"
              style={{
                background: 'linear-gradient(rgba(255,255,255,0.75), rgba(255,255,255,0) 55%)',
                transform: `rotate(${i * (360 / 26)}deg)`,
              }}
            />
          ))}
        </div>

        {/* Wallpaper Texture */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40 z-0 bg-[length:550px] sm:bg-[length:700px] bg-repeat"
          style={{ backgroundImage: `url(${texturaFondoImg})` }}
        />

        <div className="relative z-10 w-full flex flex-col items-center">
          {/* Main Title Graphic */}
          <div className="flex justify-center mb-6 px-4">
            <img
              src={tituloImg}
              alt="Whirlpool Special Days"
              className="w-[280px] sm:w-[420px] md:w-[480px] h-auto object-contain drop-shadow-md"
            />
          </div>

          {/* ================= DIV PADRE: ANCHO TOTAL CON 2 COLUMNAS / FRANJAS ================= */}
          {/* Columna 1 = Amarillo con textura uniforme del fondo | Columna 2 = Negro translúcido con textura */}
          <div className="w-full grid grid-cols-1 lg:grid-cols-2 relative z-20">
            {/* ================= FRANJA 1: ELECTRODOMÉSTICOS (FONDO Y TEXTURA IDÉNTICOS AL SITIO) ================= */}
            <div className="w-full bg-transparent text-[#101010] px-5 sm:px-10 lg:px-14 py-8 lg:py-14 flex flex-col items-center justify-center relative z-10">
              <div className="w-full max-w-[620px] aspect-[960/540] relative overflow-visible flex items-center justify-center">
                <Machine
                  state="idle"
                  readoutText="Listo para girar"
                  led1={false}
                  led2={false}
                  led3={true}
                />
              </div>

              <div className="text-center mt-5 max-w-lg">
                <span className="font-mono text-xs sm:text-sm uppercase font-black tracking-widest text-[#FDC32B] bg-[#101010] px-4 py-2 rounded-full shadow-md inline-block">
                  Gana hasta Bs. 3.000 al instante
                </span>
                <h3 className="font-display text-2xl sm:text-3xl font-black text-[#101010] mt-4 tracking-tight">
                  Compra Whirlpool y participa
                </h3>
                <p className="text-sm sm:text-base text-[#252014] font-semibold mt-2.5 leading-relaxed">
                  Tu compra de cualquier electrodoméstico Whirlpool en mercados o distribuidores autorizados te habilita a participar de la promoción. Registra tus datos para recibir tu código y hacer girar la lavadora digital.
                </p>
              </div>
            </div>

            {/* ================= FRANJA 2: FORMULARIO NEGRO TRANSLÚCIDO CON TEXTURA ================= */}
            <div className="w-full bg-[#101010]/85 backdrop-blur-md text-white px-5 sm:px-10 lg:px-14 py-10 lg:py-16 flex flex-col justify-center relative overflow-hidden border-t lg:border-t-0 lg:border-l border-white/10 shadow-[0_15px_45px_rgba(0,0,0,0.3)]">
              {/* Textura oficial integrada en la columna negra */}
              <div
                className="absolute inset-0 pointer-events-none opacity-20 z-0 bg-[length:550px] sm:bg-[length:700px] bg-repeat mix-blend-screen"
                style={{ backgroundImage: `url(${texturaFondoImg})` }}
              />

              <div className="relative z-10 w-full">
                {!submitSuccess ? (
                  <>
                    <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
                      <div>
                        <span className="text-xs uppercase font-mono tracking-widest text-[#FDC32B] font-bold">
                          Mercado informal
                        </span>
                        <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl text-white font-bold tracking-tight mt-1">
                          Registra tu Compra
                        </h2>
                      </div>
                    </div>

                    {errorMessage && (
                      <div className="mb-5 p-3.5 rounded-xl bg-red-500/20 border border-red-500/40 text-red-200 text-xs font-medium flex items-center gap-2.5">
                        <AlertCircle className="w-4 h-4 flex-none text-red-400" />
                        <span>{errorMessage}</span>
                      </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                      {/* FIELD 1: name (Nombre(s) y Apellido(s)) */}
                      <div>
                        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-[#FDC32B]" />
                          Nombre(s) y Apellido(s) *
                        </label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => {
                            setName(e.target.value);
                            setErrorMessage('');
                          }}
                          placeholder="Ej. Juan Carlos Pérez Morales"
                          className="w-full bg-black/50 backdrop-blur-sm border border-white/20 focus:border-[#FDC32B] focus:ring-2 focus:ring-[#FDC32B]/30 rounded-xl px-4 py-3.5 text-white text-sm outline-none transition-all placeholder:text-zinc-500 shadow-inner"
                        />
                      </div>

                      {/* ROW: document_number & cellphone */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* FIELD 2: document_number (Carnet de Identidad) */}
                        <div>
                          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                            <CreditCard className="w-3.5 h-3.5 text-[#FDC32B]" />
                            Carnet de Identidad (CI) *
                          </label>
                          <input
                            type="text"
                            value={documentNumber}
                            onChange={(e) => {
                              setDocumentNumber(e.target.value.replace(/\D/g, '').slice(0, 10));
                              setErrorMessage('');
                            }}
                            placeholder="7829104"
                            className="w-full bg-black/50 backdrop-blur-sm border border-white/20 focus:border-[#FDC32B] focus:ring-2 focus:ring-[#FDC32B]/30 rounded-xl px-4 py-3.5 text-white text-sm outline-none transition-all placeholder:text-zinc-500 font-mono shadow-inner"
                          />
                        </div>

                        {/* FIELD 3: cellphone (Número de Celular) */}
                        <div>
                          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-[#FDC32B]" />
                            Número de Celular *
                          </label>
                          <input
                            type="tel"
                            value={cellphone}
                            onChange={(e) => {
                              setCellphone(e.target.value.replace(/\D/g, '').slice(0, 8));
                              setErrorMessage('');
                            }}
                            placeholder="76543210"
                            className="w-full bg-black/50 backdrop-blur-sm border border-white/20 focus:border-[#FDC32B] focus:ring-2 focus:ring-[#FDC32B]/30 rounded-xl px-4 py-3.5 text-white text-sm outline-none transition-all placeholder:text-zinc-500 font-mono shadow-inner"
                          />
                        </div>
                      </div>

                      {/* FIELD 4: city (Ciudad) */}
                      <div>
                        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-[#FDC32B]" />
                          Ciudad de Compra *
                        </label>
                        <select
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="w-full bg-black/50 backdrop-blur-sm border border-white/20 focus:border-[#FDC32B] focus:ring-2 focus:ring-[#FDC32B]/30 rounded-xl px-4 py-3.5 text-white text-sm outline-none transition-all shadow-inner"
                        >
                          {BOLIVIA_CITIES.map((c) => (
                            <option key={c} value={c} className="bg-[#1A1A1A] text-white">
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* FIELD 5: file (Captura de Factura / Nota de Venta) con Optimización */}
                      <div>
                        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <Upload className="w-3.5 h-3.5 text-[#FDC32B]" />
                            Captura de Factura / Nota de Venta *
                          </span>
                        </label>

                        <div className="border-2 border-dashed border-white/20 hover:border-[#FDC32B] rounded-2xl p-5 text-center cursor-pointer transition-colors bg-black/45 hover:bg-black/60 relative">
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={handleFileSelect}
                            disabled={isSubmitting || optimizingFile}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                          />

                          {optimizingFile ? (
                            <div className="flex items-center justify-center gap-2 py-2 text-xs text-[#FDC32B]">
                              <RotateCw className="w-4 h-4 animate-spin" />
                              <span>Comprimiendo y optimizando imagen…</span>
                            </div>
                          ) : fileName ? (
                            <div className="flex items-center justify-center gap-2 py-1 text-xs text-white">
                              <FileCheck className="w-5 h-5 text-emerald-400 flex-none" />
                              <span className="truncate max-w-[280px] font-mono font-semibold">{fileName}</span>
                              <span className="text-[10px] text-zinc-400 font-normal">Cambiar archivo</span>
                            </div>
                          ) : (
                            <div className="space-y-1.5 py-1">
                              <ImageIcon className="w-7 h-7 text-[#FDC32B] mx-auto" />
                              <p className="text-xs text-slate-200 font-medium">
                                Toca aquí para seleccionar o tomar foto de tu comprobante
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Submit Button */}
                      <button
                        type="submit"
                        disabled={isSubmitting || optimizingFile}
                        className="w-full mt-4 bg-gradient-to-r from-[#FDC32B] via-[#FFE27A] to-[#FDC32B] hover:brightness-105 active:scale-95 disabled:opacity-50 text-[#101010] font-black text-sm uppercase tracking-wider py-4 rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        {isSubmitting ? (
                          <>
                            <RotateCw className="w-4 h-4 animate-spin" />
                            <span>Enviando Formulario…</span>
                          </>
                        ) : (
                          <span>Enviar Formulario para Validación →</span>
                        )}
                      </button>
                    </form>
                  </>
                ) : (
                  /* ================= SUCCESS STATE ================= */
                  <div className="py-8 text-center space-y-4 animate-fade-in">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center border-2 border-emerald-500/50">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>

                    <h3 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
                      ¡Formulario llenado con éxito!
                    </h3>

                    <div className="bg-black/60 rounded-2xl p-5 border border-white/15 text-left max-w-md mx-auto space-y-2.5 backdrop-blur-sm">
                      <div className="flex items-center justify-between text-xs pb-2 border-b border-white/10">
                        <span className="text-zinc-400">Nombre:</span>
                        <span className="font-bold text-white">{name}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs pb-2 border-b border-white/10">
                        <span className="text-zinc-400">Celular:</span>
                        <span className="font-mono font-bold text-white">{cellphone}</span>
                      </div>
                      {assignedCode && (
                        <div className="flex items-center justify-between text-xs pb-2 border-b border-white/10">
                          <span className="text-zinc-400">Código Asignado:</span>
                          <span className="font-mono font-bold text-[#FDC32B]">{assignedCode}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-zinc-400">Estado:</span>
                        <span className="font-bold text-amber-400 uppercase text-[11px]">En validación</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                      Tu comprobante ha sido recibido correctamente. Nuestro equipo realizará la validación manual y te enviaremos por mensaje de celular tu código único para que puedas hacer girar la lavadora digital y descubrir tu premio.
                    </p>

                    <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                      <Link
                        to="/girar"
                        onClick={() => {
                          window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
                        }}
                        className="w-full sm:w-auto bg-[#FDC32B] hover:bg-[#ffcf40] text-[#101010] font-black text-xs uppercase tracking-wider px-6 py-3.5 rounded-xl transition-all shadow-md active:scale-95"
                      >
                        Ir a la Lavadora (/girar)
                      </Link>
                      <button
                        type="button"
                        onClick={handleResetForm}
                        className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-3.5 rounded-xl transition-colors text-xs"
                      >
                        Registrar otro comprobante
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ================= BASES Y CONDICIONES: INTEGRADA SIN HUECOS CON EL FONDO UNIFORME ================= */}
        <LegalBar transparentBg={true} className="w-full py-10 sm:py-14 border-t border-[#101010]/10 relative z-20" />
      </main>

      {/* ================= FOOTER ================= */}
      <Footer />
    </div>
  );
};
