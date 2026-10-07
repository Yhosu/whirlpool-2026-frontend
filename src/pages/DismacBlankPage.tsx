import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

/**
 * DismacBlankPage: Route for "Comprar en Dismac"
 * Currently blank as requested by the user ("ponla en blanco de momento").
 * Includes minimal back navigation.
 */
export const DismacBlankPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#101010] text-white flex flex-col items-center justify-center p-6 select-none">
      <div className="max-w-md w-full text-center space-y-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-[#FDC32B] hover:text-white transition-colors border border-[#FDC32B]/30 hover:border-[#FDC32B] px-4 py-2 rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a Special Days
        </Link>
      </div>
    </div>
  );
};
