import { useNavigate, NavLink } from 'react-router-dom';
import { 
  HiOutlineHome, 
  HiOutlineDocumentSearch, 
  HiOutlineBriefcase,
  HiOutlineUser
} from 'react-icons/hi';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: HiOutlineHome },
  { path: '/analyze', label: 'Analyze Resume', icon: HiOutlineDocumentSearch },
  { path: '/jobs', label: 'Job Matches', icon: HiOutlineBriefcase },
  { path: '/profile', label: 'Profile', icon: HiOutlineUser },
];

const Sidebar = () => {
  const navigate = useNavigate();
  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-border hidden lg:block">
      <nav className="p-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-primary text-white shadow-md'
                  : 'text-text-secondary hover:bg-background hover:text-text-primary'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Help Card */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className="bg-gradient-to-br from-primary to-purple-600 rounded-2xl p-4 text-white">
          <h4 className="font-semibold mb-1">Need Help?</h4>
          <p className="text-sm opacity-90 mb-3">
            Check our guide for resume tips
          </p>
          <button 
            onClick={() => navigate('/guide')}
            className="w-full bg-white/20 hover:bg-white/30 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer hover:scale-105 transform"
          >
            View Guide
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
