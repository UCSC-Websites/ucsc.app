import { useContext } from "react";
import "./TopBar.css";
import TopBarButton from "../../TopBarButton";
import { Context } from "../../Context";

export function TopBar() {
    const topBarButtons = ['ucsc.info', 'news', 'peak', 'menu', 'courses'];
    const cv = useContext(Context);
    return (
        <>
            <header className="app-bar">
            
                <div className={`hamburger ${cv?.drawer ? 'open' : ''}`}
                    onClick={() => cv?.drawerFunction(!cv?.drawer)}
                >
                    <span />
                    <span />
                    <span />
                </div>
                <div className="app-bar__title">ucsc.info</div>
            </header>

            <aside className={`drawer ${cv?.drawer ? 'open' : ''}`}>
                <nav className="drawer__nav">
                    {topBarButtons.map((item) => (
                        <TopBarButton key={item}>{item}</TopBarButton>
                    ))}
                </nav>
            </aside>
        </>
    );
}

// this will need a shared state from the start
/*
export function TopBar() {
    const [opened, toggleNavbar] = useState(false);
    return (
        <AppShell
            header={{height: 50}}
            navbar={{width: 300, breakpoint: 'sm', collapsed: {mobile: !opened}}}
        >
            <AppShell.Header>
                <Group h="100%" px="md">
                    <Burger opened={opened} onClick={() => {toggleNavbar(!opened)}}
                        hiddenFrom="sm" size="sm" />
                    <Text size="xl">ucsc.info</Text>
                </Group>
            </AppShell.Header>
            <AppShell.Navbar p="mid">
                <Text size="xl">
                    holy fucking shit, 40000
                </Text>
                <Text size="xl">
                    earthmover
                </Text>
                <Text size="xl">
                    holy fucking shit, 40000
                </Text>
            </AppShell.Navbar>
        </AppShell>
    );
}
*/