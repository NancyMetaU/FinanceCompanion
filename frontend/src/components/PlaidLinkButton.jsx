import { useEffect, useState } from "react";
import { usePlaidLink } from "react-plaid-link";
import { getAuth } from "firebase/auth";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const PlaidLinkButton = () => {
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

  const onSuccess = async (public_token, metadata) => {
    const user = getAuth().currentUser;
    const idToken = await user.getIdToken();

    const res = await fetch(`${BACKEND_URL}/api/plaid/exchange_public_token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({ public_token }),
    });

    const data = await res.json();
  };

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess,
  });

  return (
    <button onClick={() => open()} disabled={!ready}>
      Link Your Bank
    </button>
  );
};

export default PlaidLinkButton;
