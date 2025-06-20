import { useState} from 'react'
import { Link, useNavigate } from "react-router-dom";
import twitterimg from "../../image/twitter.jpeg";
import TwitterIcon from "@mui/icons-material/Twitter";
import GoogleButton from "react-google-button";
import { useUserAuth } from "../../context/UserAuthContext";
import LanguageSwitcher from '../../components/LanguageSwitcher';
import "./login.css";
import { useTranslation } from 'react-i18next';
const Signup=()=>{
    const [username, setusername] = useState("");
    const [name, setname] = useState("");
    const [email, setemail] = useState("");
    const [error, seterror] = useState("");
    const [password, setpassword] = useState("");
    const { googleSignin,signin } = useUserAuth();
    const navigate = useNavigate();
    const {t}=useTranslation();
    const handlesubmit = async (e) => {
        e.preventDefault();
        seterror("");
    try {
        await signin(email, password);
        const user = {
        username: username,
        name: name,
        email: email,
      };
      fetch("https://twiller-twitterclone-2-q41v.onrender.com/register", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(user),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.acknowledged) {
            console.log(data);
            navigate("/");
          }
        });
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
            <img className="image" src={twitterimg} alt="twitterimage" />
          </div>
  
          <div className="form-container">
            <div className="">
              <TwitterIcon className="Twittericon" style={{ color: "skyblue" }} />
              <h2 className="heading">{t('Happening Now')}</h2>
              <div class="d-flex align-items-sm-center">
                <h3 className="heading1"> {t('Join twiller today')}</h3>
              </div>
              {error && <p className="errorMessage">{error}</p>}
              <form onSubmit={handlesubmit}>
                <input
                  className="display-name"
                  type="username"
                  placeholder={t("@username")}
                  onChange={(e) => setusername(e.target.value)}
                  required
                />
                <input
                  className="display-name"
                  type="name"
                  placeholder={t("Enter Full Name")}
                  onChange={(e) => setname(e.target.value)}
                  required
                />
                <input
                  className="email"
                  type="email"
                  placeholder={t("Email Address")}
                  onChange={(e) => setemail(e.target.value)}
                  required
                />
                <input
                  className="password"
                  type="password"
                  placeholder={t("Password (at least 8 Characters)")}
                  onChange={(e) => setpassword(e.target.value)}
                  pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$"
                  // Enforce minimum 8 characters

                  required
                />
                <div className="btn-login">
                  <button type="submit" className="btn">
                    {t('Sign Up')}
                  </button>
                </div>
              </form>
              <div className="google-button">
                <GoogleButton
                  className="g-btn"
                  type="light"
                  onClick={hanglegooglesignin}
                />
              </div>
              <div>
                {t('Already have an account?')}
                <Link
                  to="/login"
                  style={{
                    textDecoration: "none",
                    color: "var(--twitter-color)",
                    fontWeight: "600",
                    marginLeft: "5px",
                  }}
                >
                  {t('Log In')}
                </Link>
                 <LanguageSwitcher/>
              </div>
            </div>
          </div>
        </div>
      </>
    );
};
export default Signup;