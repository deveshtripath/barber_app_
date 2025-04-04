import axios from "axios";

const TWILIO_SERVICE_SID = "VAa43c90f4a947832c6886fa19656e4885";
const TWILIO_ACCOUNT_SID = "AC352ceea8bcd03a57bfb4ce622b6cd7a9";
const TWILIO_AUTH_TOKEN = "3d1ceac9f7e5c0bee17ec051273eeb5e";
const TWILIO_API_URL = `https://verify.twilio.com/v2/Services/${TWILIO_SERVICE_SID}/Verifications`;

const sendVerificationCode = async (phoneNumber: string) => {
  try {
    // Format phone number to E.164 format if needed
    const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
    
    const response = await axios.post(
      `https://verify.twilio.com/v2/Services/${TWILIO_SERVICE_SID}/Verifications`,
      new URLSearchParams({
        To: formattedPhone,
        Channel: "sms",
      }),
      {
        auth: {
          username: TWILIO_ACCOUNT_SID,
          password: TWILIO_AUTH_TOKEN,
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Twilio API Error:", error.response?.data);
    } else {
      console.error("Error sending verification code:", error);
    }
    throw new Error("Failed to send verification code");
  }
};

const verifyCode = async (phoneNumber: string, code: string) => {
  try {
    // Format phone number to E.164 format if needed
    const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
    
    const response = await axios.post(
      `https://verify.twilio.com/v2/Services/${TWILIO_SERVICE_SID}/VerificationCheck`,
      new URLSearchParams({
        To: formattedPhone, // Note: Twilio expects 'To' (capital T) in VerificationCheck
        Code: code,        // Note: Twilio expects 'Code' (capital C)
      }),
      {
        auth: {
          username: TWILIO_ACCOUNT_SID,
          password: TWILIO_AUTH_TOKEN,
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    return response.data.status === "approved";
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Twilio API Error:", error.response?.data);
    } else {
      console.error("Error verifying code:", error);
    }
    throw new Error("Failed to verify code");
  }
};

export { sendVerificationCode, verifyCode };
