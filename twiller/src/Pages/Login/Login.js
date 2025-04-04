import React, { useState} from 'react'
import twitterimg from "../../image/twitter.jpeg";
import TwitterIcon from "@mui/icons-material/Twitter";
import GoogleButton from "react-google-button";
import { useNavigate, Link } from "react-router-dom";
import "./login.css";
import { useUserAuth } from "../../context/UserAuthContext";
import LanguageSwitcher from '../../components/LanguageSwitcher';
import { useTranslation } from 'react-i18next';

const Login=()=>{
  const { t } = useTranslation();

    const [email, seteamil] = useState("");
    const [password, setpassword] = useState("");
    const [error, seterror] = useState("");
    const navigate = useNavigate();
    const { googleSignin ,logIn} = useUserAuth();

    const handlesubmit = async (e) => {
        e.preventDefault();
        seterror("");
    try {
      await logIn(email,password)
      navigate("/");
    } catch (error) {
      seterror(error.message);
      window.alert(error.message);
    }
   };
   const hanglegooglesignin = async (e) => {
    e.preventDefault();
    try {
      await googleSignin();
      navigate("/");
    } catch (error) {
      console.log(error.message);
    }
  };
    return(
        <>
        
            <div className="login-container">
              
        <div className="image-container">
          <img src={twitterimg} className=" image" alt="twitterimg" />
        </div>
        <div className="form-container">
          <div className="form-box">
            <TwitterIcon style={{ color: "skyblue" }} />
            <h2 className="heading">{t('Happening Now')}</h2>
            {error && <p>{error.message}</p>}
            <form onSubmit={handlesubmit}>
              <input
                type="email"
                className="email"
                placeholder="Email address"
                onChange={(e) => seteamil(e.target.value)}
                required
              />
              <input
                type="password"
                className="password"
                placeholder="Password"
                onChange={(e) => setpassword(e.target.value)}
                required
              />
              <div className="btn-login">
                <button type="submit" className="btn">
                {t('Log In')}
                </button>
              </div>
            </form>
            <hr />
            <div>
              <GoogleButton className="g-btn" type="light" onClick={hanglegooglesignin}/>
              <Link
              to="/resetpass"
              style={{
                textDecoration: "none",
                color: "var(--twitter-color)",
                fontWeight: "600",
                marginLeft: "5px",
              }}
            >
              {t('Forgot Password?')}
            </Link>
            </div>
            
          </div>
          <div>
            {t("Don't have an account?")}
            <Link
              to="/signup"
              style={{
                textDecoration: "none",
                color: "var(--twitter-color)",
                fontWeight: "600",
                marginLeft: "5px",
              }}
            >
              {t('Sign Up')}
            </Link>
            <LanguageSwitcher/>
          </div>
        </div>
      </div>
        </>
    );
};
export default Login;