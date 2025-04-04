import React, { useState } from 'react'
import { Box, Modal } from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import { IconButton } from "@mui/material";
import TextField from "@mui/material/TextField";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import "./Editprofile.css";
import { useTranslation } from 'react-i18next';

const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 600,
    height: 600,
    bgcolor: "background.paper",
    boxShadow: 24,
    borderRadius: 8,
};

function Editchild({ dob,setdob }) {
    const [open, setopen] = useState(false);
    const {t}=useTranslation();
    const handleopen = () => {
      setopen(true);
    };
    const handleclose = () => {
      setopen(false);
    };
    return (
      <React.Fragment>
        <div className="birthdate-section" onClick={handleopen}>
          <text>Edit</text>
        </div>
        <Modal
          hideBackdrop
          open={open}
          onClose={handleclose}
          aria-labelledby="child-modal-title"
          aria-describedby="child-modal-descriptiom"
        >
          <Box sx={{ ...style, width: 300, height: 300 }}>
            <div className="text">
              <h2>{t('Edit date of birth')}</h2>
              <p>
                {t('This can only be changed a few times Make sure you enter the age of the person using the account.')}{" "}
              </p>
              <input type="date" onChange={(e) => setdob(e.target.value)} />
              <button
                className="e-button"
                onClick={() => {
                  setopen(false);
                }}
              >
                {t('Cancel')}
              </button>
            </div>
          </Box>
        </Modal>
      </React.Fragment>
    );
}

const Editprofile=({ user, loggedinuser })=>{
    const [name, setname] = useState("");
    const [bio, setbio] = useState("");
    const [location, setlocation] = useState("");
    const [website, setwebsite] = useState("");
    const [open, setopen] = useState(false);
    const [dob, setdob] = useState("");
    const {t}=useTranslation();
    const handlesave = () => {
      const editinfo = {
        name,
        bio,
        location,
        website,
        dob,
      };
      fetch(`https://twiller-twitterclone-2-q41v.onrender.com/userupdate/${user?.email}`, {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(editinfo),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log("done", data);
        });
    };
    return(
        <div>
        <button
          onClick={() => {
            setopen(true);
          }}
          className="Edit-profile-btn"
        >
          {t('Edit Profile')}
        </button>
        <Modal
          open={open}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-descriptiom"
        >
             <Box style={style} className="modal">
          <div className="header">
            <IconButton onClick={() => setopen(false)}>
              <CloseIcon />
            </IconButton>
            <h2 className="header-title">{t('Edit Profile')}</h2>
            <button className="save-btn" onClick={handlesave}>{t('Save')}</button>
          </div>
          <form className="fill-content">
            <TextField
              className="text-field"
              fullWidth
              label={t("Name")}
              id="fullWidth"
              variant="filled"
              onChange={(e) => setname(e.target.value)}
              deafultValue={loggedinuser[0]?.name ? loggedinuser[0].name : ""}
            />
            <TextField
              className="text-field"
              fullWidth
              label={t("Bio")}
              id="fullWidth"
              variant="filled"
              onChange={(e) => setbio(e.target.value)}
              deafultValue={loggedinuser[0]?.bio ? loggedinuser[0].bio : ""}
            />
            <TextField
              className="text-field"
              fullWidth
              label={t("Location")}
              id="fullWidth"
              variant="filled"
              onChange={(e) => setlocation(e.target.value)}
              deafultValue={
                loggedinuser[0]?.location ? loggedinuser[0].location : ""
              }
            />
            <TextField
              className="text-field"
              fullWidth
              label="Website"
              id="fullWidth"
              variant="filled"
              onChange={(e) => setwebsite(e.target.value)}
              deafultValue={
                loggedinuser[0]?.website ? loggedinuser[0].website : ""
              }
            />
            </form>
          <div className="birthdate-section">
            <p>{t('Birth Date')}</p>
            <p>.</p>
            <Editchild dob={dob} setdob={setdob} className="edit-btn" />
          </div>
          <div className="last-section">
            {loggedinuser[0]?.dob ? (
              <h2>{loggedinuser[0]?.dob}</h2>
            ) : (
              <h2>{dob ? dob : "Add your date of birth"}</h2>
            )}
            <div className="last-btn">
              <h2>{t('Switch to Professional')}</h2>
              <ChevronRightIcon />
            </div>
          </div>
        </Box>
      </Modal>
    </div>
    );
};

export default Editprofile;