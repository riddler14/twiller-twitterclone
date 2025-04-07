import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios'; // For making API calls to the backend
import "./LanguageSwitcher.css";

const LanguageSwitcher = () => {
  const { t, i18n } = useTranslation();
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [emailOrMobile, setEmailOrMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [verificationMethod, setVerificationMethod] = useState('');
  const [verificationSent, setVerificationSent] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [verificationError, setVerificationError] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState('en'); // Track the selected language

  // Function to handle language selection
  const changeLanguage = (lng) => {
    setSelectedLanguage(lng); // Update the selected language
    // Set the verification method: 'email' for French and English, 'sms' for others
    setVerificationMethod(['fr', 'en'].includes(lng) ? 'email' : 'sms');
    setIsPopupOpen(true); // Open the popup for email/phone input
    // Do NOT change the language here; wait until OTP verification succeeds
  };

  // Function to reset the popup state
  const resetPopupState = () => {
    setEmailOrMobile('');
    setOtp('');
    setVerificationSent(false);
    setVerificationSuccess(false);
    setVerificationError('');
    setRetryCount(0);
  };

  // Function to close the popup and reset its state
  const closePopup = () => {
    setIsPopupOpen(false);
    resetPopupState();
  };

  // Function to send email OTP via backend
  const sendEmailOTP = async () => {
    try {
      if (!emailOrMobile || !emailOrMobile.includes('@')) {
        setVerificationError(t('invalid_email_format'));
        return;
      }

      // Call the backend to send an OTP via email
      const response = await axios.post('https://twiller-twitterclone-2-q41v.onrender.com/send-email-otp', { email: emailOrMobile });

      console.log(response.data.message);
      setVerificationSent(true);
    } catch (error) {
      console.error('Error sending email OTP:', error);
      setVerificationError(t('error_sending_otp'));
    }
  };

  // Function to send SMS OTP via backend
  const sendSMSOTP = async () => {
    try {
      if (!/^\+\d{10,15}$/.test(emailOrMobile)) {
        setVerificationError(t('Invalid Phone Number'));
        return;
      }

      // Call the backend to send an OTP via SMS
      const response = await axios.post('https://twiller-twitterclone-2-q41v.onrender.com/send-sms-otp', { phoneNumber: emailOrMobile });

      console.log(response.data.message);
      setVerificationSent(true);
    } catch (error) {
      console.error('Error sending SMS OTP:', error);
      setVerificationError(t('Error Sending OTP'));
    }
  };

  // Function to verify OTP via backend
  const handleVerifyOtp = async () => {
    try {
      let response;
      if (verificationMethod === 'email') {
        // Verify OTP using the backend endpoint
        response = await axios.post('https://twiller-twitterclone-2-q41v.onrender.com/verify-otp', { email: emailOrMobile, otp });
      } else if (verificationMethod === 'sms') {
        // Verify OTP using the backend endpoint
        response = await axios.post('https://twiller-twitterclone-2-q41v.onrender.com/verify-otp', { phoneNumber: emailOrMobile, otp });
      }

      if (response.data.success) {
        console.log(t('verification_success'));

        // Change the language only after OTP verification succeeds
        const lng = selectedLanguage || 'en'; // Fallback to 'en' if no language is selected
        console.log("Saving language to localStorage:", lng); // Debugging line
        i18n.changeLanguage(lng); // Switch the language here
        localStorage.setItem('language', lng); // Save the language preference
        setVerificationSuccess(true);
        closePopup(); // Close the popup on success
      } else {
        setVerificationError(t('error_verifying_otp'));
        setRetryCount(retryCount + 1);
        if (retryCount >= 3) {
          closePopup(); // Close the popup after 3 failed attempts
        }
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      setVerificationError(t('error_verifying_otp'));
      setRetryCount(retryCount + 1);
      if (retryCount >= 3) {
        closePopup(); // Close the popup after 3 failed attempts
      }
    }
  };

  // Handle input changes for email/mobile
  const handleEmailOrMobileChange = (e) => {
    setEmailOrMobile(e.target.value);
  };

  // Handle OTP input changes
  const handleOtpChange = (e) => {
    setOtp(e.target.value);
  };

  // Handle sending OTP manually
  const handleSendOtpManually = async () => {
    if (verificationMethod === 'email') {
      await sendEmailOTP();
    } else if (verificationMethod === 'sms') {
      await sendSMSOTP();
    }
  };

  return (
    <div className="language-switcher">
      {/* Language Buttons */}
      <button onClick={() => changeLanguage('en')}>English</button>
      <button onClick={() => changeLanguage('es')}>Español</button>
      <button onClick={() => changeLanguage('hi')}>हिंदी</button>
      <button onClick={() => changeLanguage('pt')}>Português</button>
      <button onClick={() => changeLanguage('zh')}>中文</button>
      <button onClick={() => changeLanguage('fr')}>Français</button>

      {/* Popup for Email/Phone Input and OTP Verification */}
      {isPopupOpen && (
        <div className="popup-overlay">
          <div className="popup-content">
            {!verificationSent ? (
              <>
                <h3>{t('Enter Email/Phone')}</h3>
                {verificationMethod === 'email' && (
                  <input
                    type="text"
                    placeholder={t('Enter Email')}
                    value={emailOrMobile}
                    onChange={handleEmailOrMobileChange}
                  />
                )}
                {verificationMethod === 'sms' && (
                  <input
                    type="text"
                    placeholder={t('Enter Phone Number')}
                    value={emailOrMobile}
                    onChange={handleEmailOrMobileChange}
                  />
                )}
                <button onClick={handleSendOtpManually}>{t('Send OTP')}</button>
                {verificationError && <p className="error-message">{verificationError}</p>}
              </>
            ) : (
              <>
                <h3>{t('Enter OTP')}</h3>
                <input
                  type="text"
                  placeholder={t('Enter OTP')}
                  value={otp}
                  onChange={handleOtpChange}
                />
                <button onClick={handleVerifyOtp}>{t('Verify OTP')}</button>
                {verificationError && <p className="error-message">{verificationError}</p>}
              </>
            )}
            <button onClick={closePopup}>{t('Close')}</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;