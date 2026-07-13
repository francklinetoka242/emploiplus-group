import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function CreationMotivationRedirect() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const slug = params.get("job") || (location.state as any)?.slug;

    if (slug) {
      navigate(`/candidate/jobs/${slug}/apply`, { replace: true });
      return;
    }

    // If no slug is provided, forward to documents center
    navigate(`/candidate/documents`, { replace: true });
  }, [location, navigate]);

  return null;
}
