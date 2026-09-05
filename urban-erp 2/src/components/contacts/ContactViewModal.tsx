import { Contact } from '../../types/contact';
import { X, Mail, Phone, MapPin, Building, Globe, Edit2, Ban, CheckCircle2, User } from 'lucide-react';

interface ContactViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  contact: Contact | null;
  onEdit: (contact: Contact) => void;
  onDeactivate: (contact: Contact) => void;
}

export default function ContactViewModal({
  isOpen,
  onClose,
  contact,
  onEdit,
  onDeactivate
}: ContactViewModalProps) {
  if (!isOpen || !contact) return null;

  const typeColor = 
    contact.type === 'CUSTOMER' ? 'bg-blue-50 text-blue-700 border-blue-200' :
    contact.type === 'VENDOR' ? 'bg-purple-50 text-purple-700 border-purple-200' :
    'bg-emerald-50 text-emerald-700 border-emerald-200';

  const statusColor = 
    contact.status === 'ACTIVE' 
      ? 'bg-green-50 text-green-700 border-green-200' 
      : 'bg-gray-100 text-gray-600 border-gray-200';

  const initials = contact.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(p => p[0].toUpperCase())
    .join('') || 'U';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm overflow-y-auto">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-lg overflow-hidden my-8 transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gray-50/50">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Contact Details</h2>
            <p className="text-xs text-gray-500 mt-0.5">Comprehensive profile & accounting link</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Identity & Avatar Card */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50/70 border border-gray-100">
            {contact.profileImage ? (
              <img
                src={contact.profileImage}
                alt={contact.name}
                referrerPolicy="no-referrer"
                className="w-16 h-16 rounded-2xl object-cover border border-gray-200 shadow-sm"
                onError={(e) => {
                  // Fallback to initials if image fails
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6D54B5] to-purple-400 text-white font-bold text-xl flex items-center justify-center shadow-sm">
                {initials}
              </div>
            )}

            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-gray-900 truncate">{contact.name}</h3>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${typeColor}`}>
                  {contact.type === 'BOTH' ? 'Customer & Vendor' : contact.type}
                </span>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusColor}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${contact.status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-400'}`} />
                  {contact.status}
                </span>
              </div>
            </div>
          </div>

          {/* Contact Details List */}
          <div className="space-y-3.5 text-sm">
            <div className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 bg-white">
              <Mail className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Email Address</span>
                {contact.email ? (
                  <a href={`mailto:${contact.email}`} className="text-gray-900 font-medium hover:text-[#6D54B5] transition-colors">
                    {contact.email}
                  </a>
                ) : (
                  <span className="text-gray-400 italic">Not provided</span>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 bg-white">
              <Phone className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Mobile Number</span>
                {contact.mobile ? (
                  <a href={`tel:${contact.mobile}`} className="text-gray-900 font-medium hover:text-[#6D54B5] transition-colors">
                    {contact.mobile}
                  </a>
                ) : (
                  <span className="text-gray-400 italic">Not provided</span>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 bg-white">
              <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Street Address</span>
                <span className="text-gray-900 font-medium block">
                  {contact.address || <span className="text-gray-400 italic">Not provided</span>}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl border border-gray-100 bg-white">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">City</span>
                <span className="text-gray-900 font-medium truncate block">
                  {contact.city || '—'}
                </span>
              </div>

              <div className="p-3 rounded-xl border border-gray-100 bg-white">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">State</span>
                <span className="text-gray-900 font-medium truncate block">
                  {contact.state || '—'}
                </span>
              </div>

              <div className="p-3 rounded-xl border border-gray-100 bg-white">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Pincode</span>
                <span className="text-gray-900 font-medium truncate block">
                  {contact.pincode || '—'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between gap-3">
          {contact.status === 'ACTIVE' ? (
            <button
              onClick={() => {
                onClose();
                onDeactivate(contact);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-red-200 text-red-600 text-xs font-semibold hover:bg-red-50 transition-colors"
            >
              <Ban className="w-3.5 h-3.5" />
              Deactivate
            </button>
          ) : (
            <button
              onClick={() => {
                onClose();
                onDeactivate(contact);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-green-200 text-green-700 text-xs font-semibold hover:bg-green-50 transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Reactivate
            </button>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 text-xs font-semibold hover:bg-white transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                onEdit(contact);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#6D54B5] text-white text-xs font-semibold hover:bg-purple-700 transition-colors shadow-sm"
            >
              <Edit2 className="w-3.5 h-3.5" />
              Edit Contact
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
