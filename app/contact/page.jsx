'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [projectType, setProjectType] = useState('Projet sur-mesure');
  const [message, setMessage] = useState('');

  // Remplacez ce numéro par votre propre numéro WhatsApp (format international sans le + ni les espaces, ex: 33612345678)
  const whatsappNumber = '33689016070'; 

  const handleWhatsAppSubmit = (e) => {
    e.preventDefault();
    const text = `Bonjour, je m'appelle ${name}. Type de projet : ${projectType}. Message : ${message}`;
    const encodedText = encodeURIComponent(text);
    window.open(`https://wa.me/${whatsappNumber}?text=${encodedText}`, '_blank');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 space-y-8">
      <div>
        <Link href="/" className="text-sm text-[#6B5B52] hover:underline mb-4 inline-block">
          ← Retour à l'accueil
        </Link>
        <h1 className="text-3xl font-serif font-bold text-[#4A3B32] mb-2">Contact & Sur-mesure</h1>
        <p className="text-[#6B5B52]">
          Vous avez une idée particulière, une demande de devis ou une question sur une création ? Envoyez-moi un message !
        </p>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-[#EFECE6] shadow-xs">
        <form onSubmit={handleWhatsAppSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-[#6B5B52] mb-1">Votre nom</label>
            <input
              required
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Marie Dupont"
              className="w-full border border-[#EFECE6] rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#5A3E36]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#6B5B52] mb-1">Sujet / Type de projet</label>
            <select
              value={projectType}
              onChange={(e) => setProjectType(e.target.value)}
              className="w-full border border-[#EFECE6] rounded-2xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#5A3E36]"
            >
              <option value="Projet sur-mesure / Devis">Projet sur-mesure / Devis</option>
              <option value="Autre demande">Autre demande</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#6B5B52] mb-1">Votre message ou description du projet</label>
            <textarea
              required
              rows="4"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Décrivez ce que vous aimeriez (couleurs, dimensions, quantité...)"
              className="w-full border border-[#EFECE6] rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#5A3E36]"
            ></textarea>
          </div>

          <button
            type="submit"
            className="w-full bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold py-3.5 rounded-2xl transition flex items-center justify-center gap-2 shadow-sm"
          >
            <span>Ouvrir WhatsApp pour envoyer</span>
          </button>
        </form>
      </div>
    </div>
  );
}
