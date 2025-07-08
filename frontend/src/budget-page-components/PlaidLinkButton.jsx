import { useEffect, useState } from "react";
import { usePlaidLink } from "react-plaid-link";
import { getAuth } from "firebase/auth";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const PlaidLinkButton = ({ onBankLinked }) => {
  const [linkToken, setLinkToken] = useState(null);

  useEffect(() => {
    const fetchLinkToken = async () => {
      const user = getAuth().currentUser;
      if (!user) return;

      const idToken = await user.getIdToken();

      const res = await fetch(`${BACKEND_URL}/api/plaid/create_link_token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
      });

      const data = await res.json();
      setLinkToken(data.link_token);
    };

    fetchLinkToken();
  }, []);

  const onSuccess = async (public_token) => {
    const user = getAuth().currentUser;
    const idToken = await user.getIdToken();

    try {
      const response = await fetch(`${BACKEND_URL}/api/plaid/link_bank`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ public_token }),
      });

      if (response.ok) {
        if (onBankLinked) {
          onBankLinked();
        }
      }
    } catch (error) {
      console.error("Error linking bank:", error);
    }
  };

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess,
  });

  return (
    <button
      onClick={() => open()}
      disabled={!ready}
      className="text-md font-medium text-royal border border-royal px-4 py-1.5 rounded-md hover:bg-royal hover:text-white transition cursor-pointer"
    >
      {ready ? "Link Your Bank" : "Loading..."}
    </button>
  );
};

export default PlaidLinkButton;
