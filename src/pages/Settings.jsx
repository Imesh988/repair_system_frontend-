import React, { useState, useEffect } from 'react';
import { FiUser, FiMail, FiPhone, FiLock, FiSave, FiShield, FiKey, FiUserCheck } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

const Settings = () => {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState({
    full_name: '',
    email: '',
    phone: '',
    new_password: '',
    confirm_password: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/auth/me');
      setProfile(prev => ({
        ...prev,
        full_name: response.data.name,
        email: response.data.email,
        phone: response.data.phone || ''
      }));
    } catch (error) {
      toast.error('Failed to load profile');
    }
  };

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (profile.new_password && profile.new_password !== profile.confirm_password) {
      toast.error('New passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        full_name: profile.full_name,
        phone: profile.phone,
        email: profile.email
      };
      if (profile.new_password) {
        payload.password = profile.new_password;
      }
      await api.put(`/employees/${user.id}`, payload);
      
      const emailChanged = profile.email !== user.email;
      const passwordChanged = !!profile.new_password;

      toast.success('Profile updated successfully');

      if (emailChanged || passwordChanged) {
        toast.success('Please login again with your new credentials');
        setTimeout(() => {
          logout();
        }, 1500);
      } else {
        setProfile(prev => ({
          ...prev,
          new_password: '',
          confirm_password: ''
        }));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl shadow-lg">
          <FiShield className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">Settings</h1>
          <p className="text-sm text-gray-500">Manage your profile and security</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50 px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2">
            <FiUserCheck className="w-5 h-5 text-amber-500" />
            Profile Information
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
            <div className="relative">
              <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400 w-4 h-4" />
              <input
                type="text"
                name="full_name"
                value={profile.full_name}
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-sky-500 w-4 h-4" />
              <input
                type="email"
                name="email"
                value={profile.email}
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Changing email will require you to login again</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number</label>
            <div className="relative">
              <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500 w-4 h-4" />
              <input
                type="tel"
                name="phone"
                value={profile.phone}
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>
          </div>

          <div className="border-t border-dashed border-gray-200 pt-5 mt-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg">
                <FiKey className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-semibold text-gray-800">Change Password</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">New Password</label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400 w-4 h-4" />
                  <input
                    type="password"
                    name="new_password"
                    value={profile.new_password}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                    placeholder="Leave blank to keep current"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Confirm New Password</label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400 w-4 h-4" />
                  <input
                    type="password"
                    name="confirm_password"
                    value={profile.confirm_password}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                    placeholder="Confirm new password"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl hover:from-amber-600 hover:to-orange-700 transition-all shadow-md shadow-amber-200 font-medium disabled:opacity-50"
            >
              <FiSave className="w-4 h-4" />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;