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

  // Function to handle language selection
  const changeLanguage = (lng) => {
    setVerificationMethod(lng === 'fr' ? 'email' : 'sms');
    setIsPopupOpen(true); // Open the popup for email/phone input
    i18n.changeLanguage(lng); // Change language but delay full switching until OTP is verified
  };

  // Function to send email OTP via backend
  const sendEmailOTP = async () => {
    try {
      if (!emailOrMobile || !emailOrMobile.includes('@')) {
        setVerificationError(t('invalid_email_format'));
        return;
      }

      // Call the backend to send an OTP via email
      const response = await axios.post('/send-email-otp', { email: emailOrMobile });

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
        setVerificationError(t('invalid_phone_number'));
        return;
      }

      // Call the backend to send an OTP via SMS
      const response = await axios.post('/send-sms-otp', { phoneNumber: emailOrMobile });

      console.log(response.data.message);
      setVerificationSent(true);
    } catch (error) {
      console.error('Error sending SMS OTP:', error);
      setVerificationError(t('error_sending_otp'));
    }
  };

  // Function to verify OTP via backend
  const handleVerifyOtp = async () => {
    try {
      let response;
      if (verificationMethod === 'email') {
        // Verify OTP using the backend endpoint
        response = await axios.post('/verify-otp', { email: emailOrMobile, otp });
      } else if (verificationMethod === 'sms') {
        // Verify OTP using the backend endpoint
        response = await axios.post('/verify-otp', { phoneNumber: emailOrMobile, otp });
      }

      if (response.data.success) {
        console.log(t('verification_success'));
        setVerificationSuccess(true);
        setIsPopupOpen(false); // Close the popup on success
      } else {
        setVerificationError(t('error_verifying_otp'));
        setRetryCount(retryCount + 1);
        if (retryCount >= 3) {
          setIsPopupOpen(false); // Close the popup after 3 failed attempts
        }
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      setVerificationError(t('error_verifying_otp'));
      setRetryCount(retryCount + 1);
      if (retryCount >= 3) {
        setIsPopupOpen(false); // Close the popup after 3 failed attempts
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
                <h3>{t('Enter Email or Phone')}</h3>
                {verificationMethod === 'email' && (
                  
                  <input
                    type="text"
                    placeholder={t('Enter Email Address')}
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
                <button onClick={handleSendOtpManually}>{t('send_otp')}</button>
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
                <button onClick={handleVerifyOtp}>{t('verify_otp')}</button>
                {verificationError && <p className="error-message">{verificationError}</p>}
              </>
            )}
            <button onClick={() => setIsPopupOpen(false)}>{t('Close')}</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;