import { useLocation } from 'react-router-dom';
import './TopBar.css';
import TopBarButton from '../../TopBarButton';
import ThemeToggle from '../../ThemeChanger';

export function TopBar() {
    const location = useLocation();
    const isInsights = location.pathname.includes("insights");

    const topBarButtons = ['insights', 'news', 'menu', 'courses'];
    
    return (
        <header className={`app-bar ${isInsights ? 'glass-topbar' : ''}`}>
            <nav className="nav-bar__nav">
                {topBarButtons.map((item) => (
                    <TopBarButton key={item}>{item}</TopBarButton>
                ))}
            </nav>
            <div className="nav-bar__theme-toggle">
                <ThemeToggle />
            </div>
        </header>
    );
}
