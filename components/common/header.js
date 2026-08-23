import React, { useState, useEffect, useRef,useCallback } from 'react';
//import { usePathname, useRouter } from 'next/navigation';
import { useRouter } from 'next/router';
import { useUser } from '../user/userContext';
import '@fortawesome/fontawesome-free/css/all.min.css';
import RevertImpersonationButton from '../utilities/handleRevert';
import Link from 'next/link';
import ImageWithLoader from '../misc/imageWithLoader';
import TopBar from './topbar';
import helpLinks from './helpLinks';
import auctionLinks from './auctionLinks';

const MOBILE_MENU_BREAKPOINT = 1000;
const AUTH_MAINTENANCE_MODE = false;
const AUTH_MAINTENANCE_FALLBACK_HREF = '/contact';

const Header = () => {

  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Track mobile menu state
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const dropdownRefs = useRef({});
  const headerRef = useRef(null);
  const { user, logout } = useUser();
  const router = useRouter();
  const pathname = router.pathname; 

  const toggleDropdown = (dropdownName) => {
    setActiveDropdown((prev) => (prev === dropdownName ? null : dropdownName));
  };

  const handleClickOutside = useCallback((event) => {
    if (
      activeDropdown &&
      dropdownRefs.current[activeDropdown] &&
      !dropdownRefs.current[activeDropdown].contains(event.target)
    ) {
      setActiveDropdown(null);
    }
  }, [activeDropdown]);

  const logoutHandler = () => {
    logout();
    setActiveDropdown(null);
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeDropdown,handleClickOutside]);

  const [searchKeyword, setSearchKeyword] = useState('');
  const handleSearch = () => {
    router.push(`/stock-list?search=${encodeURIComponent(searchKeyword)}`);
  };

  // Keep the header box in sync with the active search everywhere on the
  // site: while actually on a filtered /stock-list?search=..., show that;
  // on any other page (a vehicle detail page, help, home...) fall back to
  // the last search the customer ran, so it doesn't just go blank the
  // moment they click away. stockListV2.js owns writing/clearing this key
  // (it clears it on Reset), so this is a read-only fallback here.
  useEffect(() => {
    const q = router.query?.search;
    const fromUrl = typeof q === 'string' ? q : Array.isArray(q) ? q[0] || '' : '';
    if (fromUrl) {
      setSearchKeyword(fromUrl);
      return;
    }
    try {
      setSearchKeyword(sessionStorage.getItem('meridian_last_search') || '');
    } catch (e) {
      setSearchKeyword('');
    }
  }, [router.query?.search]);

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  useEffect(() => {
    setIsMobileMenuOpen(false); // Close mobile menu when route changes
  }, [pathname]);


  useEffect(() => {
  const leftLinks = document.querySelectorAll('.left-links > *').length;
  const rightLinks = document.querySelectorAll('.right-links > *').length;
  const totalLinks = leftLinks + rightLinks;
  //console.log(totalLinks)

  const rightLinksContainer = document.querySelector('.right-links');
  if (totalLinks % 2 !== 0) {
    rightLinksContainer.classList.add('odd-total');
  } else {
    rightLinksContainer.classList.remove('odd-total');
  }
}, [isMobileMenuOpen]);

  useEffect(() => {
    const updateViewport = () => {
      if (typeof window === 'undefined') {
        return;
      }
      const isMobile = window.innerWidth < MOBILE_MENU_BREAKPOINT;
      setIsMobileViewport(isMobile);
      if (!isMobile) {
        setIsMobileMenuOpen(false);
      }
    };

    updateViewport();
    window.addEventListener('resize', updateViewport);
    return () => {
      window.removeEventListener('resize', updateViewport);
    };
  }, []);

  useEffect(() => {
    if (!isMobileMenuOpen) {
      return;
    }

    const handleOutsideMenu = (event) => {
      if (headerRef.current && !headerRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false);
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleOutsideMenu);
    document.addEventListener('touchstart', handleOutsideMenu);

    return () => {
      document.removeEventListener('mousedown', handleOutsideMenu);
      document.removeEventListener('touchstart', handleOutsideMenu);
    };
  }, [isMobileMenuOpen]);

  const mobileMenuClass =
    !isMobileViewport || isMobileMenuOpen ? 'mobile-menu-open' : '';

  const renderGuestAuth = () => (
    <div className="header-item signin-item">
      <div className="flex items-center gap-2">
        <i className="fas fa-user icon"></i>
        {AUTH_MAINTENANCE_MODE ? (
          <span
            className="signin-disabled-link"
            role="link"
            aria-disabled="true"
            title="Sign In/Up is temporarily unavailable"
          >
            Sign In/Up
          </span>
        ) : (
          <Link href="/login">Sign In/Up</Link>
        )}
      </div>
      {AUTH_MAINTENANCE_MODE && (
        <>
          <span className="maintenance-badge">Under maintenance, back soon</span>
          <Link href={AUTH_MAINTENANCE_FALLBACK_HREF} className="maintenance-help-link">
            Need help now? Contact us
          </Link>
        </>
      )}
    </div>
  );

  return (
    <div className="header-wrapper" ref={headerRef}>
      <TopBar />
      <div className="header-container px-2 sm:px-4 lg:px-6">
        <header className="main-header header">
          <div className="header-top flex items-center gap-2">
            <div className="menu-logo-container flex items-center gap-3">
              <Link className="logo flex items-center shrink-0" href="/">
                <ImageWithLoader
                  src="/images/logo-meridian-dark.svg"
                  alt="Meridian Motors Inc. logo"
                  className="logo-img"
                />
              </Link>
            </div>

            {/* Mobile Search Input */}
            {isMobileViewport && (
              <div className="header-search mobile-only relative flex items-center gap-2 px-4 py-2 text-sm flex-1">
                <input
                  type="text"
                  placeholder="Search by keyword..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full bg-transparent text-sm outline-none"
                />
                <i className="fas fa-search search-icon" onClick={handleSearch}></i>
              </div>
            )}

            <div className="header-main-row desktop-only">
              <div className="header-search relative flex items-center gap-2 px-4 py-2 text-sm">
                <input
                  type="text"
                  placeholder="Search by keyword..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full bg-transparent text-sm outline-none"
                />
                <i className="fas fa-search search-icon" onClick={handleSearch}></i>
              </div>
              <div className="header-actions flex items-center gap-4">
                <div className="header-item flex items-center gap-2">
                  <Link href="/contact">Contact</Link>
                </div>
                {!user ? (
                  renderGuestAuth()
                ) : (
                  <>
                    <div className="header-item flex items-center gap-2">
                      <i className="fas fa-user icon"></i> <Link href="/profile">Profile</Link>
                    </div>
                    {user?.role === 'admin' && (
                      <div className="header-item flex items-center gap-2">
                        <i className="fas fa-user-shield icon"></i> <Link href="/admin">Admin</Link>
                      </div>
                    )}
                    <button onClick={logoutHandler} className="header-item logout-btn flex items-center gap-2">
                      <i className="fas fa-sign-out-alt icon"></i> Sign Out
                    </button>
                    {user && user.isImpersonating && <RevertImpersonationButton />}
                  </>
                )}
              </div>
            </div>
          
            {/* Mobile Menu Toggle */}
            {isMobileViewport && (
              <div
                className="menu-toggle flex h-10 w-10 items-center justify-center rounded-md border border-brand-navy/20 text-xl text-brand-navy"
                role="button"
                aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={isMobileMenuOpen}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <i className="fas fa-times"></i>
                ) : (
                  <i className="fas fa-bars"></i>
                )}
              </div>
            )}
          </div>

          <nav
            className="header-icons header-buttons-row mobile-actions md:mt-2 md:mb-2 flex w-full flex-wrap items-center gap-4 text-sm text-brand-navy md:w-auto md:justify-start"
            aria-label="Mobile quick actions"
          >
            <ul className="flex w-full flex-wrap items-center justify-center gap-4 list-none p-0 m-0">
              <li className="header-item flex items-center gap-2">
                <Link href="/contact">Contact</Link>
              </li>
              <li className="header-item flex items-center gap-2">
                <Link href="/stock-list">Browse Stock</Link>
              </li>
              <li className="header-item flex items-center gap-2">
                <Link href="/shipping">Shipping</Link>
              </li>

              {!user ? (
                <li>{renderGuestAuth()}</li>
              ) : (
                <>
                  <li className="header-item flex items-center gap-2">
                    <i className="fas fa-user icon"></i> <Link href="/profile">Profile</Link>
                  </li>
                  {user?.role === 'admin' && (
                    <li className="header-item flex items-center gap-2">
                      <i className="fas fa-user-shield icon"></i> <Link href="/admin">Admin</Link>
                    </li>
                  )}
                  <li>
                    <button onClick={logoutHandler} className="header-item logout-btn flex items-center gap-2">
                      <i className="fas fa-sign-out-alt icon"></i> Sign Out
                    </button>
                  </li>
                  {user && user.isImpersonating && (
                    <li className="header-item flex items-center gap-2">
                      <RevertImpersonationButton />
                    </li>
                  )}
                </>
              )}
            </ul>
          </nav>

        {/* Mobile Menu Content */}
        <nav
          className={`header-bottom border-t border-brand-navy/10 pt-2 ${mobileMenuClass}`}
          aria-label="Primary navigation"
        >
          <ul className="left-links flex flex-col gap-4 md:flex-row md:items-center">
            <li className="flex items-center gap-2">
              <Link className="flex flex-col md:flex-row items-center" href="/stock-list" onClick={() => setIsMobileMenuOpen(false)}>
                <i className="fas fa-warehouse icon"></i>
                Browse Stock
              </Link>
            </li>

            {/* Auction Dropdown */}
            <li
              className="nav-item dropdown flex items-center gap-2"
              ref={(el) => (dropdownRefs.current['auction'] = el)}
              onClick={() => toggleDropdown('auction')}
            >
              <i className="fas fa-gavel icon"></i>
              Auction <span className="arrow">▼</span>
              <div
                className={`dropdown-content ${
                  activeDropdown === 'auction' ? 'show' : ''
                }`}
              >
                {auctionLinks.map((link) => (
                  <Link key={link.path} href={link.path} onClick={() => setIsMobileMenuOpen(false)}>{link.text}</Link>
                ))}
              </div>
            </li>
          </ul>

          <ul className="right-links flex flex-col gap-4 md:flex-row md:items-center">

            {/* Help Dropdown */}
            <li
              className="nav-item dropdown flex items-center gap-2"
              ref={(el) => (dropdownRefs.current['overview'] = el)}
              onClick={() => toggleDropdown('overview')}
            >
              Help <span className="arrow">▼</span>
              <div
                className={`dropdown-content help ${
                  activeDropdown === 'overview' ? 'show' : ''
                }`}
              >
                {helpLinks.map((link) => (
                  <Link key={link.path} href={link.path}>{link.text}</Link>
                ))}
              </div>
            </li>
          </ul>
        </nav>
      </header>
    </div>
    </div>

  );
};

export default Header;
