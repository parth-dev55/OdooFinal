import { useState, useEffect, FormEvent } from 'react';
import { Contact, ContactType, CreateContactDTO, UpdateContactDTO } from '../../types/contact';
import { X, Loader2, AlertCircle, CheckCircle2, User, Mail, Phone, MapPin, Building, Globe, Image as ImageIcon } from 'lucide-react';

interface ContactFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateContactDTO | UpdateContactDTO) => Promise<void>;
  initialData?: Contact | null;
  mode: 'create' | 'edit';
}

export default function ContactFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode
}: ContactFormModalProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<ContactType>('CUSTOMER');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [stateVal, setStateVal] = useState('');
  const [pincode, setPincode] = useState('');
  const [profileImage, setProfileImage] = useState('');

  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (initialData && mode === 'edit') {
      setName(initialData.name || '');
      setType(initialData.type || 'CUSTOMER');
      setEmail(initialData.email || '');
      setMobile(initialData.mobile || '');
      setAddress(initialData.address || '');
      setCity(initialData.city || '');
      setStateVal(initialData.state || '');
      setPincode(initialData.pincode || '');
      setProfileImage(initialData.profileImage || '');
    } else {
      setName('');
      setType('CUSTOMER');
      setEmail('');
      setMobile('');
      setAddress('');
      setCity('');
      setStateVal('');
      setPincode('');
      setProfileImage('');
    }
    setFieldErrors({});
    setApiError('');
    setSuccessMessage('');
  }, [initialData, mode, isOpen]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!name.trim()) {
      errors.name = 'Contact name is required.';
    }

    if (!type) {
      errors.type = 'Contact type is required.';
    }

    if (email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        errors.email = 'Please enter a valid email address.';
      }
    }

    if (mobile.trim()) {
      // Allow standard mobile format (e.g., 7 to 15 digits, optional + or spaces/hyphens)
      const phoneClean = mobile.replace(/[\s\-()]/g, '');
      if (!/^\+?[0-9]{7,15}$/.test(phoneClean)) {
        errors.mobile = 'Please enter a valid phone number (7-15 digits).';
      }
    }

    if (pincode.trim()) {
      if (!/^[0-9A-Za-z\s\-]{3,10}$/.test(pincode.trim())) {
        errors.pincode = 'Please enter a valid postal/pincode.';
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setApiError('');
    setSuccessMessage('');

    if (!validate()) {
      return;
    }

    setLoading(true);

    const payload: CreateContactDTO = {
      name: name.trim(),
      type,
      email: email.trim() || undefined,
      mobile: mobile.trim() || undefined,
      address: address.trim() || undefined,
      city: city.trim() || undefined,
      state: stateVal.trim() || undefined,
      pincode: pincode.trim() || undefined,
      profileImage: profileImage.trim() || undefined,
    };

    try {
      await onSubmit(payload);
      setSuccessMessage(mode === 'create' ? 'Contact added successfully!' : 'Contact updated successfully!');
      setTimeout(() => {
        onClose();
      }, 800);
    } catch (err: any) {
      setApiError(err?.message || 'Failed to save contact. Please check your backend connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm overflow-y-auto">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-2xl overflow-hidden my-8 transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gray-50/50">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {mode === 'create' ? 'Add New Contact' : 'Edit Contact'}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {mode === 'create' ? 'Add a new customer, vendor, or partner to your database.' : 'Update existing contact credentials and details.'}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* API Error Alert */}
          {apiError && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200/80 text-red-700 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block">Error saving contact:</span>
                <span>{apiError}</span>
              </div>
            </div>
          )}

          {/* Success Alert */}
          {successMessage && (
            <div className="p-4 rounded-xl bg-green-50 border border-green-200/80 text-green-800 text-sm flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-green-600" />
              <span className="font-medium">{successMessage}</span>
            </div>
          )}

          {/* Contact Type Selector */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
              Contact Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['CUSTOMER', 'VENDOR', 'BOTH'] as ContactType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`py-2.5 px-3 rounded-xl border text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                    type === t
                      ? 'border-[#6D54B5] bg-purple-50/70 text-[#6D54B5] shadow-sm'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600 bg-white'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${
                    t === 'CUSTOMER' ? 'bg-blue-500' : t === 'VENDOR' ? 'bg-purple-500' : 'bg-emerald-500'
                  }`} />
                  {t === 'BOTH' ? 'Customer & Vendor' : t.charAt(0) + t.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
            {fieldErrors.type && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.type}</p>
            )}
          </div>

          {/* Name & Email Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="contact-name" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="contact-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Modern Craft Furnishings"
                  className={`w-full pl-10 pr-3.5 py-2.5 bg-white border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6D54B5] transition-all text-gray-900 ${
                    fieldErrors.name ? 'border-red-400' : 'border-gray-200'
                  }`}
                />
              </div>
              {fieldErrors.name && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.name}</p>
              )}
            </div>

            <div>
              <label htmlFor="contact-email" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="contact-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contact@company.com"
                  className={`w-full pl-10 pr-3.5 py-2.5 bg-white border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6D54B5] transition-all text-gray-900 ${
                    fieldErrors.email ? 'border-red-400' : 'border-gray-200'
                  }`}
                />
              </div>
              {fieldErrors.email && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>
              )}
            </div>
          </div>

          {/* Mobile & Profile Image URL Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="contact-mobile" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Mobile Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="contact-mobile"
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="+1 555-0199"
                  className={`w-full pl-10 pr-3.5 py-2.5 bg-white border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6D54B5] transition-all text-gray-900 ${
                    fieldErrors.mobile ? 'border-red-400' : 'border-gray-200'
                  }`}
                />
              </div>
              {fieldErrors.mobile && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.mobile}</p>
              )}
            </div>

            <div>
              <label htmlFor="contact-image" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Profile Image URL
              </label>
              <div className="relative">
                <ImageIcon className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="contact-image"
                  type="url"
                  value={profileImage}
                  onChange={(e) => setProfileImage(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6D54B5] transition-all text-gray-900"
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div>
            <label htmlFor="contact-address" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Street Address
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              <textarea
                id="contact-address"
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Suite 400, 123 Timberland Blvd"
                className="w-full pl-10 pr-3.5 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6D54B5] transition-all text-gray-900 resize-none"
              />
            </div>
          </div>

          {/* City, State, Pincode Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="contact-city" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                City
              </label>
              <div className="relative">
                <Building className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="contact-city"
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Seattle"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6D54B5] transition-all text-gray-900"
                />
              </div>
            </div>

            <div>
              <label htmlFor="contact-state" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                State / Province
              </label>
              <div className="relative">
                <Globe className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="contact-state"
                  type="text"
                  value={stateVal}
                  onChange={(e) => setStateVal(e.target.value)}
                  placeholder="Washington"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6D54B5] transition-all text-gray-900"
                />
              </div>
            </div>

            <div>
              <label htmlFor="contact-pincode" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Pincode / Postal
              </label>
              <input
                id="contact-pincode"
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="98101"
                className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6D54B5] transition-all text-gray-900 ${
                  fieldErrors.pincode ? 'border-red-400' : 'border-gray-200'
                }`}
              />
              {fieldErrors.pincode && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.pincode}</p>
              )}
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-[#6D54B5] text-white font-semibold text-sm hover:bg-purple-700 transition-all shadow-md shadow-purple-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving to Backend...
                </>
              ) : mode === 'create' ? (
                'Add Contact'
              ) : (
                'Update Contact'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
