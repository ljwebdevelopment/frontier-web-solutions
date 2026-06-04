import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  BarChart2,
  Bell,
  CreditCard,
  FileText,
  FolderOpen,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Settings,
  TrendingUp,
  User,
  Users,
} from 'lucide-react';
import logo from '../assets/FWSlogo-white.png';
import { useAuth } from '../context/AuthContext.jsx';

const adminLinks = [
  {
    section: 'Overview',
    items: [
      { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    section: 'Business',
    items: [
      { to: '/admin/clients', label: 'Clients', icon: Users },
      { to: '/admin/leads', label: 'Leads', icon: TrendingUp },
      { to: '/admin/forms', label: 'Form Submissions', icon: FileText },
    ],
  },
  {
    section: 'System',
    items: [
      { to: '/admin/settings', label: 'Settings', icon: Settings },
    ],
  },
];

const portalLinks = [
  {
    section: 'My Website',
    items: [
      { to: '/portal', label: 'Overview', icon: LayoutDashboard },
      { to: '/portal/analytics', label: 'Analytics', icon: BarChart2 },
      { to: '/portal/forms', label: 'Form Submissions', icon: FileText },
    ],
  },
  {
    section: 'Account',
    items: [
      { to: '/portal/support', label: 'Requests', icon: LifeBuoy },
      { to: '/portal/billing', label: 'Billing', icon: CreditCard },
      { to: '/portal/documents', label: 'Documents', icon: FolderOpen },
      { to: '/portal/profile', label: 'Profile', icon: User },
    ],
  },
];

export default function DashboardLayout({ area }) {
  const { logout, profile } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  const linkGroups = area === 'admin' ? adminLinks : portalLinks;

  return (
    <div className="dashboard-shell">
      <aside className="sidebar">
        <div className="sidebar-logo-wrap">
          <img src={logo} alt="Frontier Web Systems" className="sidebar-logo" />
        </div>

        {linkGroups.map((group) => (
          <div key={group.section} className="sidebar-section">
            <div className="sidebar-section-label">{group.section}</div>
            <nav className="sidebar-nav" aria-label={group.section}>
              {group.items.map(({ to, label, icon: Icon }) => (
                <NavLink key={to} to={to} end={to === `/${area}`}>
                  <Icon size={15} />
                  {label}
                </NavLink>
              ))}
            </nav>
          </div>
        ))}

        <div className="sidebar-bottom">
          <nav className="sidebar-nav">
            <button className="sidebar-action" onClick={handleLogout}>
              <LogOut size={15} />
              Sign Out
            </button>
          </nav>
        </div>
      </aside>

      <div className="workspace">
        <header className="workspace-header">
          <div>
            <p>{area === 'admin' ? 'Owner Workspace' : 'Client Portal'}</p>
            <h1>{area === 'admin' ? 'Frontier Web Systems' : profile?.businessName || 'Website Portal'}</h1>
          </div>
          <div className="workspace-user">
            <Bell size={16} />
            <span>{profile?.email}</span>
          </div>
        </header>
        <Outlet />
      </div>
    </div>
  );
}
