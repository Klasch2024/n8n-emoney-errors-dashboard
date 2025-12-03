'use client';

import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Bell, Volume2, VolumeX, User } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'account' | 'notifications'>('account');
  const [notificationSoundEnabled, setNotificationSoundEnabled] = useState(true);
  const [userName, setUserName] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');

  useEffect(() => {
    // Load user info from localStorage
    const name = localStorage.getItem('userName') || '';
    const email = localStorage.getItem('userEmail') || '';
    setUserName(name);
    setUserEmail(email);

    // Load setting from localStorage
    const saved = localStorage.getItem('notificationSoundEnabled');
    if (saved !== null) {
      setNotificationSoundEnabled(saved === 'true');
    }
  }, []);

  const handleToggleNotificationSound = (enabled: boolean) => {
    setNotificationSoundEnabled(enabled);
    localStorage.setItem('notificationSoundEnabled', enabled.toString());
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#F5F5F5] mb-2">Settings</h1>
        <p className="text-[#BEBEBE]">Manage your dashboard preferences</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#333333]">
        <button
          onClick={() => setActiveTab('account')}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
            activeTab === 'account'
              ? 'text-[#E67514] border-[#E67514]'
              : 'text-[#BEBEBE] border-transparent hover:text-[#F5F5F5]'
          }`}
        >
          Account
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
            activeTab === 'notifications'
              ? 'text-[#E67514] border-[#E67514]'
              : 'text-[#BEBEBE] border-transparent hover:text-[#F5F5F5]'
          }`}
        >
          Notifications
        </button>
      </div>

      {/* Account Tab */}
      {activeTab === 'account' && (
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <User className="text-[#E67514]" size={24} />
            <h2 className="text-xl font-semibold text-[#F5F5F5]">Account Information</h2>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-[#1A1A1A] rounded-lg border border-[#333333]">
              <label className="block text-sm font-medium text-[#8A8A8A] mb-1">
                User Name
              </label>
              <p className="text-base font-medium text-[#F5F5F5]">
                {userName || 'Not available'}
              </p>
            </div>

            <div className="p-4 bg-[#1A1A1A] rounded-lg border border-[#333333]">
              <label className="block text-sm font-medium text-[#8A8A8A] mb-1">
                Email
              </label>
              <p className="text-base font-medium text-[#F5F5F5]">
                {userEmail || 'Not available'}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="text-[#E67514]" size={24} />
            <h2 className="text-xl font-semibold text-[#F5F5F5]">Notifications</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-[#1A1A1A] rounded-lg border border-[#333333]">
              <div className="flex items-center gap-3">
                {notificationSoundEnabled ? (
                  <Volume2 className="text-[#E67514]" size={20} />
                ) : (
                  <VolumeX className="text-[#8A8A8A]" size={20} />
                )}
                <div>
                  <h3 className="text-base font-medium text-[#F5F5F5]">Error Notification Sound</h3>
                  <p className="text-sm text-[#BEBEBE]">
                    Play a sound when new errors are detected
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleToggleNotificationSound(!notificationSoundEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notificationSoundEnabled
                    ? 'bg-[#E67514]'
                    : 'bg-[#333333]'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notificationSoundEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

