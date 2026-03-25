useEffect(() => {
  const authPages = ['/login', '/signup'];
  const isAuthPage = authPages.includes(window.location.pathname);
  if (isAuthPage) {
    refreshProfile();
  }
}, []);