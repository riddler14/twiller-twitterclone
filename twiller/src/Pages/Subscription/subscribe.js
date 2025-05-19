import React, { useState } from "react";
import "../Chatbot/chatbot.css";
import { useTranslation } from "react-i18next";
import VerifiedUserIcon from "@mui/icons-material/Verified";
import Button from "@mui/material/Button"; // Import Material UI Button
import useLoggedinuser from "../../hooks/useLoggedinuser";
const Subscribe = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const [loggedinuser] = useLoggedinuser();
  const email = loggedinuser[0]?.email;
  const plans = [
    {
      name: "Bronze",
      price: "₹100/month",
      benefits: ["3 tweets per month"],
    },
    {
      name: "Silver",
      price: "₹300/month",
      benefits: ["5 tweets per month"],
    },
    {
      name: "Gold",
      price: "₹1000/month",
      benefits: ["Unlimited tweets"],
    },
  ];

  const handlePayment = async (plan) => {
    setLoading(true);
    try {
      if (!email || !email.includes("@")) {
        alert("Please log in or provide a valid email.");
        return;
      }
      // Call the backend to create a Razorpay order
      const response = await fetch(
        "https://twiller-twitterclone-2-q41v.onrender.com/subscribe",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email, plan: plan.name.toLowerCase() }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        // Handle specific error messages
        if (data.error === "Already subscribed to a plan") {
          alert("You are already subscribed to this plan.");
        } else {
          throw new Error(data.error || "Failed to create Razorpay order");
        }
        return;
      }

      // Initialize Razorpay with the order details
      const options = {
        key: "rzp_test_tXIry42LkGIxXt", // Replace with your Razorpay test or live key
        amount: data.amount,
        currency: data.currency,
        name: data.name, // Replace with your app name
        description: `${plan.name} Subscription`,
        order_id: data.orderId,
        handler: function (response) {
          alert("Payment successful!");
          console.log("Payment response:", response);
          // Redirect to a success page or update UI as needed
        },
        prefill: {
          email: email, // Replace with the user's email
          // Replace with the user's phone number
        },
        theme: {
          color: "#3f51b5", // Customize the theme color
        },
      };

      // Open the Razorpay payment popup
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Error processing payment:", error);
      alert("Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chatbot">
      <div className="chatbot__header">
        <h2>
          Subscricptions{" "}
          <span className="post__headerSpecial">
            <VerifiedUserIcon className="post__badge" />
          </span>
        </h2>
      </div>
      {/* Display Subscription Plans */}
      <div className="plans-container">
        {plans.map((plan, index) => (
          <div key={index} className="plan-card">
            <h3>{plan.name}</h3>
            <p className="plan-price">{plan.price}</p>
            <ul>
              {plan.benefits.map((benefit, idx) => (
                <li key={idx}>{benefit}</li>
              ))}
            </ul>
            <Button
              variant="contained"
              color="primary"
              onClick={() => handlePayment(plan)}
              disabled={loading}
            >
              {loading ? t("Processing...") : t("Subscribe")}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Subscribe;
