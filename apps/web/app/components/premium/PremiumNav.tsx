'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut as nextAuthSignOut } from 'next-auth/react';
import { useEffect, useRef, useState } from 'react';
import { Badge } from '@ai-pass/ui';
import { BrandLogoLink } from '../BrandLogoLink';
import { LANDING_NAV, SITE_NAV, type SiteNavItem } from '../../lib/site-nav';
import { researchBarItems } from '../../lib/hopn-lab';
import { useApp } from './AppProviders';
import styles from './premium-nav.module.css';

function isActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  if (href.startsWith('/#')) return pathname === '/';
  if (href.startsWith('http')) return false;
  return pathname === href || (href !== '/' && pathname.startsWith(href));
}

function isNavItemActive(pathname: string | null, item: SiteNavItem): boolean {
  if (item.type === 'link') return isActive(pathname, item.href);
  if (item.label === 'Trust' && pathname) {
    if (pathname === '/trust' || pathname.startsWith('/trust/') || pathname.startsWith('/verify/')) {
      return true;
    }
    if (pathname.startsWith('/workspace/trust') || pathname.startsWith('/workspace/governance')) {
      return true;
    }
  }
  return item.items.some((link) => isActive(pathname, link.href));
}

function NavDropdownLink({
  href,
  label,
  description,
  external,
  onNavigate,
}: {
  href: string;
  label: string;
  description?: string;
  external?: boolean;
  onNavigate?: () => void;
}) {
  const className = styles.megaLink;
  const content = (
    <>
      <span className={styles.megaLinkLabel}>{label}</span>
      {description && <span className={styles.megaLinkDesc}>{description}</span>}
    </>
  );

  if (external || href.startsWith('mailto:')) {
    return (
      <a
        href={href}
        className={className}
        target={href.startsWith('mailto:') ? undefined : '_blank'}
        rel={href.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
        onClick={onNavigate}
      >
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={className} onClick={onNavigate}>
      {content}
    </Link>
  );
}

export function PremiumNav({ variant = 'business' }: { variant?: 'landing' | 'business' }) {
  const pathname = usePathname();
  const { user, signOut, unreadCount, markAllRead, notifications, resolvedTheme, setTheme } = useApp();
  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>('Research');
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserOpen(false);
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpenDropdown(null);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setMobileExpanded(null);
    setOpenDropdown(null);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const planBadge = user?.plan === 'enterprise' ? 'enterprise' : user?.plan === 'pro' ? 'pro' : 'default';

  const closeMobile = () => {
    setMobileOpen(false);
    setMobileExpanded(null);
  };

  const openMenu = (label: string) => {
    setOpenDropdown(label);
  };

  const toggleMobileSection = (label: string) => {
    setMobileExpanded((current) => (current === label ? null : label));
  };

  const handleSignOut = async () => {
    setUserOpen(false);
    signOut();
    await nextAuthSignOut({ callbackUrl: '/' });
  };

  const renderAvatar = () => {
    if (user?.avatarUrl) {
      return <img src={user.avatarUrl} alt="" className={styles.avatarImg} />;
    }
    return <span className={styles.avatar}>{user?.avatarInitials ?? '?'}</span>;
  };

  const researchLinks = researchBarItems();
  const menuItems = variant === 'landing' ? LANDING_NAV : SITE_NAV;

  return (
    <header className={styles.navShell}>
    <nav className={`${styles.nav} ${variant === 'landing' ? styles.navLanding : ''}`} ref={navRef}>
      <BrandLogoLink className={styles.logo} logoClassName={styles.logoImg} height={40} onClick={closeMobile} />

      <div className={styles.navLinks}>
        {menuItems.map((item) =>
          item.type === 'link' ? (
            item.external ? (
              <a
                key={item.label}
                href={item.href}
                className={`${styles.navLink} ${isActive(pathname, item.href) ? styles.navLinkActive : ''}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {item.label}
              </a>
            ) : (
              <Link
                key={item.label}
                href={item.href}
                className={`${styles.navLink} ${isActive(pathname, item.href) ? styles.navLinkActive : ''}`}
              >
                {item.label}
              </Link>
            )
          ) : (
            <div
              key={item.label}
              className={styles.navDropdown}
              onMouseEnter={() => openMenu(item.label)}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <button
                type="button"
                className={`${styles.navDropdownTrigger} ${isNavItemActive(pathname, item) ? styles.navLinkActive : ''}`}
                aria-expanded={openDropdown === item.label}
                aria-haspopup="true"
                onClick={() => openMenu(item.label)}
              >
                {item.label}
                <span className={styles.chevron} aria-hidden />
              </button>
              {openDropdown === item.label && (
                <div
                  className={`${styles.megaMenu} ${item.wide ? styles.megaMenuWide : ''}`}
                  role="menu"
                >
                  {item.items.map((link) => (
                    <NavDropdownLink
                      key={`${item.label}-${link.label}`}
                      href={link.href}
                      label={link.label}
                      description={link.description}
                      external={link.external}
                      onNavigate={() => setOpenDropdown(null)}
                    />
                  ))}
                </div>
              )}
            </div>
          ),
        )}
      </div>

      <div className={styles.navActions}>
        {variant === 'business' ? (
        <button
          type="button"
          className={`${styles.iconBtn} ${styles.desktopOnly}`}
          onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
          title={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
          aria-label="Toggle theme"
        >
          {resolvedTheme === 'dark' ? '☀️' : '🌙'}
        </button>
        ) : null}

        {variant === 'business' && (
          <>
            <div className={`${styles.dropdownWrap} ${styles.desktopOnly}`} ref={notifRef}>
              <button
                type="button"
                className={styles.iconBtn}
                onClick={() => setNotifOpen((o) => !o)}
                aria-label="Notifications"
              >
                🔔
                {unreadCount > 0 && <span className={styles.badgeCount}>{unreadCount}</span>}
              </button>
              {notifOpen && (
                <div className={styles.dropdown}>
                  <div className={styles.dropdownHeader}>
                    <strong>Notifications</strong>
                    <button type="button" className={styles.textBtn} onClick={markAllRead}>
                      Mark all read
                    </button>
                  </div>
                  {notifications.map((n) => (
                    <div key={n.id} className={`${styles.notifItem} ${n.read ? '' : styles.notifUnread}`}>
                      <div className={styles.notifTitle}>{n.title}</div>
                      <div className={styles.notifBody}>{n.body}</div>
                      <div className={styles.notifTime}>{n.time}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Link href="/help" className={`${styles.iconBtn} ${styles.desktopOnly}`} title="Help & docs" aria-label="Help">
              ?
            </Link>
          </>
        )}

        {variant === 'landing' ? (
          user ? (
            <>
              <Link href="/workspace/playground" className={`${styles.btnGhost} ${styles.desktopOnly}`}>
                Playground
              </Link>
              <div className={`${styles.dropdownWrap} ${styles.desktopOnly}`} ref={userRef}>
                <button type="button" className={styles.userBtn} onClick={() => setUserOpen((o) => !o)}>
                  {renderAvatar()}
                  <span className={styles.userName}>{user.name}</span>
                </button>
                {userOpen && (
                  <div className={styles.dropdown}>
                    <div className={styles.userMeta}>
                      <strong>{user.name}</strong>
                      <span>{user.email}</span>
                    </div>
                    <Link href="/workspace/playground" className={styles.menuItem} onClick={() => setUserOpen(false)}>
                      AI Playground
                    </Link>
                    <Link href="/workspace" className={styles.menuItem} onClick={() => setUserOpen(false)}>
                      Workspace
                    </Link>
                    <Link href="/workspace/membership" className={styles.menuItem} onClick={() => setUserOpen(false)}>
                      Upgrade plan
                    </Link>
                    <hr className={styles.menuDivider} />
                    <button type="button" className={styles.menuItemBtn} onClick={handleSignOut}>
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link href="/login" className={`${styles.btnGhost} ${styles.desktopOnly}`}>
                Sign In
              </Link>
              <Link href="/login" className={`${styles.btnPrimary} ${styles.desktopOnly}`}>
                Start Free
              </Link>
            </>
          )
        ) : user ? (
          <>
            <Link href="/workspace" className={`${styles.btnGhost} ${styles.desktopOnly}`}>
              Platform
            </Link>
            <div className={`${styles.dropdownWrap} ${styles.desktopOnly}`} ref={userRef}>
              <button type="button" className={styles.userBtn} onClick={() => setUserOpen((o) => !o)}>
                {renderAvatar()}
                <span className={styles.userName}>{user.name}</span>
                <Badge variant={planBadge as 'pro' | 'enterprise' | 'default'}>{user.plan}</Badge>
              </button>
              {userOpen && (
                <div className={styles.dropdown}>
                  <div className={styles.userMeta}>
                    <strong>{user.name}</strong>
                    <span>{user.email}</span>
                    <span className={styles.workspace}>{user.workspace}</span>
                  </div>
                  <Link href="/dashboard" className={styles.menuItem} onClick={() => setUserOpen(false)}>
                    Dashboard
                  </Link>
                  <Link href="/settings" className={styles.menuItem} onClick={() => setUserOpen(false)}>
                    Settings & Profile
                  </Link>
                  <Link href="/billing" className={styles.menuItem} onClick={() => setUserOpen(false)}>
                    Billing & Plan
                  </Link>
                  <Link href="/workspace/solutions" className={styles.menuItem} onClick={() => setUserOpen(false)}>
                    My Solutions
                  </Link>
                  <button type="button" className={styles.menuItemBtn} onClick={() => setUserOpen(false)}>
                    Switch workspace
                  </button>
                  <hr className={styles.menuDivider} />
                  <Link href="/help" className={styles.menuItem} onClick={() => setUserOpen(false)}>
                    Help center
                  </Link>
                  <button type="button" className={styles.menuItemBtn} onClick={handleSignOut}>
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <Link href="/login" className={`${styles.btnPrimary} ${styles.desktopOnly}`}>
            Sign In
          </Link>
        )}

        <button
          type="button"
          className={styles.hamburger}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((o) => !o)}
        >
          <span className={mobileOpen ? styles.hamburgerOpen : undefined} />
          <span className={mobileOpen ? styles.hamburgerOpen : undefined} />
          <span className={mobileOpen ? styles.hamburgerOpen : undefined} />
        </button>
      </div>

      {mobileOpen && (
        <div className={styles.mobilePanel}>
          <div className={styles.mobileScroll}>
            {variant === 'business' ? (
              <>
            <p className={styles.mobileSectionLabel}>Research</p>
            {researchLinks.map((link) => (
              <Link
                key={`mobile-research-${link.href}`}
                href={link.href}
                className={`${styles.mobileTopLink} ${isActive(pathname, link.href) ? styles.mobileTopLinkActive : ''}`}
                onClick={closeMobile}
              >
                {link.label}
              </Link>
            ))}
              </>
            ) : null}
            <p className={styles.mobileSectionLabel}>Menu</p>
            {menuItems.map((item) =>
              item.type === 'link' ? (
                item.external ? (
                  <a
                    key={item.label}
                    href={item.href}
                    className={styles.mobileTopLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={closeMobile}
                  >
                    {item.label}
                  </a>
                ) : (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`${styles.mobileTopLink} ${isActive(pathname, item.href) ? styles.mobileTopLinkActive : ''}`}
                    onClick={closeMobile}
                  >
                    {item.label}
                  </Link>
                )
              ) : (
                <div key={item.label} className={styles.mobileAccordion}>
                  <button
                    type="button"
                    className={`${styles.mobileAccordionTrigger} ${mobileExpanded === item.label ? styles.mobileAccordionOpen : ''}`}
                    aria-expanded={mobileExpanded === item.label}
                    onClick={() => toggleMobileSection(item.label)}
                  >
                    {item.label}
                    <span className={styles.chevron} aria-hidden />
                  </button>
                  {(mobileExpanded === item.label || item.label === 'Research') && (
                    <div className={styles.mobileSubmenu}>
                      {item.items.map((link) => (
                        <NavDropdownLink
                          key={`${item.label}-${link.label}`}
                          href={link.href}
                          label={link.label}
                          description={link.description}
                          external={link.external}
                          onNavigate={closeMobile}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ),
            )}
          </div>
          <div className={styles.mobileFooter}>
            {variant === 'business' ? (
            <button
              type="button"
              className={styles.mobileThemeBtn}
              onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            >
              {resolvedTheme === 'dark' ? '☀️ Light mode' : '🌙 Dark mode'}
            </button>
            ) : null}
            <Link href={user ? '/workspace' : '/login'} className={styles.btnPrimary} onClick={closeMobile}>
              {user ? 'Go to Workspace' : 'Start Free'}
            </Link>
            {!user && (
              <Link href="/login" className={styles.btnGhost} onClick={closeMobile}>
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
    {pathname?.startsWith('/research') || pathname === '/demo' ? (
    <div className={styles.navStrip} aria-label="Research programs">
      {researchLinks.map((link) =>
        link.href.startsWith('mailto:') ? (
          <a key={link.href} href={link.href} className={styles.navStripLink}>
            {link.label}
          </a>
        ) : (
          <Link
            key={link.href}
            href={link.href}
            className={`${styles.navStripLink} ${pathname === link.href ? styles.navStripLinkActive : ''}`}
            onClick={closeMobile}
          >
            {link.label}
          </Link>
        ),
      )}
    </div>
    ) : null}
    </header>
  );
}
