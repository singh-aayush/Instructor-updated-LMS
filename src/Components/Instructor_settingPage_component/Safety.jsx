import React, { useState, useContext } from 'react';
import { ThemeContext } from '../../themeContext';

const SecurityTab = () => {
  const { theme } = useContext(ThemeContext);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [activeSessions, setActiveSessions] = useState([
    { id: 1, name: 'Current Session', device: 'Chrome on Windows', isCurrent: true },
  ]);
  const [privacySettings, setPrivacySettings] = useState({
    publicProfile: true,
    showOnlineStatus: false,
    allowRecommendations: true,
  });

  const addTestSession = () => {
    setActiveSessions([
      ...activeSessions,
      {
        id: activeSessions.length + 1,
        name: `Session ${activeSessions.length + 1}`,
        device: 'Firefox on macOS',
        isCurrent: false,
      },
    ]);
  };

  const revokeSession = (id) => {
    setActiveSessions(activeSessions.filter((session) => session.id !== id));
  };

  const revokeAllSessions = () => {
    setActiveSessions(activeSessions.filter((session) => session.isCurrent));
  };

  const handlePrivacyChange = (field) => {
    setPrivacySettings({ ...privacySettings, [field]: !privacySettings[field] });
  };

  const handleSubmit = () => {
    // Implement security settings save logic here
    console.log('Security settings:', { twoFactorEnabled, privacySettings });
  };

  return (
    <>
      <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'} mb-6`}>Privacy & Security</h3>
      <div className="space-y-6">
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Two-Factor Authentication</h4>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mt-1`}>Add an extra layer of security to your account</p>
            </div>
            <div
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                twoFactorEnabled
                  ? theme === 'dark'
                    ? 'bg-green-600/20 text-green-400 border border-green-600/30'
                    : 'bg-green-100 text-green-800 border border-green-200'
                  : theme === 'dark'
                  ? 'bg-gray-600/20 text-gray-400 border border-gray-600/30'
                  : 'bg-gray-100 text-gray-800 border border-gray-200'
              }`}
            >
              {twoFactorEnabled ? 'Enabled' : 'Disabled'}
            </div>
          </div>
          {twoFactorEnabled ? (
            <div className="space-y-3">
              <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-green-600/20 border border-green-600/30' : 'bg-green-100 border border-green-200'}`}>
                <div className="flex items-center">
                  <i className={`fas fa-shield-alt mr-2 ${theme === 'dark' ? 'text-green-400' : 'text-green-800'}`}></i>
                  <span className={`text-sm ${theme === 'dark' ? 'text-green-400' : 'text-green-800'}`}>Your account is protected with 2FA</span>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowBackupCodes(true)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    theme === 'dark' ? 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30' : 'bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200'
                  }`}
                >
                  <i className="fas fa-key mr-2"></i>
                  View Backup Codes
                </button>
                <button
                  onClick={() => setTwoFactorEnabled(false)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    theme === 'dark' ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30' : 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200'
                  }`}
                >
                  <i className="fas fa-times mr-2"></i>
                  Disable 2FA
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShow2FASetup(true)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105 ${
                theme === 'dark'
                  ? 'bg-gradient-to-r from-gray-800 to-black hover:from-gray-700 hover:to-gray-900 text-white shadow-lg shadow-gray-800/25'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25'
              }`}
            >
              <i className="fas fa-shield-alt mr-2"></i>
              Enable 2FA
            </button>
          )}
        </div>
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
          <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'} mb-3`}>Privacy Settings</h4>
          <div className="space-y-3">
            <label className="flex items-center justify-between">
              <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Make profile public</span>
              <input
                type="checkbox"
                checked={privacySettings.publicProfile}
                onChange={() => handlePrivacyChange('publicProfile')}
                className="text-blue-500"
              />
            </label>
            <label className="flex items-center justify-between">
              <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Show online status</span>
              <input
                type="checkbox"
                checked={privacySettings.showOnlineStatus}
                onChange={() => handlePrivacyChange('showOnlineStatus')}
                className="text-blue-500"
              />
            </label>
            <label className="flex items-center justify-between">
              <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Allow course recommendations</span>
              <input
                type="checkbox"
                checked={privacySettings.allowRecommendations}
                onChange={() => handlePrivacyChange('allowRecommendations')}
                className="text-blue-500"
              />
            </label>
          </div>
        </div>
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
          <div className="flex items-center justify-between mb-3">
            <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Active Sessions</h4>
            <button
              onClick={addTestSession}
              className={`px-2 py-1 text-sm rounded transition-colors ${
                theme === 'dark' ? 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-400' : 'bg-blue-50 hover:bg-blue-100 text-blue-600'
              }`}
              title="Add test session for demo"
            >
              <i className="fas fa-plus mr-1"></i>
              Add Test Session
            </button>
          </div>
          <div className="space-y-3">
            {activeSessions.length === 0 ? (
              <div className="text-center py-4">
                <i className={`fas fa-desktop text-2xl mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}`}></i>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>No active sessions</p>
              </div>
            ) : (
              activeSessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between">
                  <div>
                    <p className={`font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{session.name}</p>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{session.device}</p>
                  </div>
                  {session.isCurrent ? (
                    <span className={`px-2 py-1 text-sm rounded ${theme === 'dark' ? 'bg-green-600/20 text-green-400' : 'bg-green-100 text-green-800'}`}>
                      Active
                    </span>
                  ) : (
                    <button
                      onClick={() => revokeSession(session.id)}
                      className={`text-sm font-medium transition-colors ${theme === 'dark' ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-700'}`}
                    >
                      Revoke
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
        {activeSessions.some((session) => !session.isCurrent) && (
          <div className="mt-4">
            <button
              onClick={revokeAllSessions}
              className={`w-full py-2 px-4 rounded-lg font-medium transition-all duration-300 ${
                theme === 'dark' ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30' : 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200'
              }`}
            >
              <i className="fas fa-sign-out-alt mr-2"></i>
              Revoke All Other Sessions
            </button>
          </div>
        )}
      </div>
      <div className="flex justify-end space-x-2 mt-6">
        <button
          className={`px-4 py-2 border font-normal md:font-medium rounded-md hover:bg-gray-50 ${theme === 'dark' ? 'border-white/20 text-gray-300 hover:bg-white/5' : 'border-gray-200 text-gray-700'}`}
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className={`px-3 py-3 rounded-xl text-[13px] md:font-medium transition-all duration-300 hover:scale-105 ${
            theme === 'dark'
              ? 'bg-gradient-to-r from-gray-800 to-black hover:from-gray-700 hover:to-gray-900 text-white shadow-lg shadow-gray-800/25'
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25'
          }`}
        >
          Save Security Settings
        </button>
      </div>
    </>
  );
};

export default SecurityTab;