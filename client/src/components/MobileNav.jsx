import { NavLink } from 'react-router-dom';
import { 
  HiOutlineHome, 
  HiOutlineDocumentSearch, 
  HiOutlineBriefcase,
  HiOutlineUser
} from 'react-icons/hi';

const navItems = [
  { path: '/dashboard', label: 'Home', icon: HiOutlineHome },
  { path: '/analyze', label: 'Analyze', icon: HiOutlineDocumentSearch },
  { path: '/jobs', label: 'Jobs', icon: HiOutlineBriefcase },
  { path: '/profile', label: 'Profile', icon: HiOutlineUser },
];

const MobileNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-border lg:hidden z-50">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
                isActive
                  ? 'text-primary'
                  : 'text-text-secondary'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={`w-6 h-6 ${isActive ? 'text-primary' : ''}`} />
                <span className="text-xs font-medium">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default MobileNav;
