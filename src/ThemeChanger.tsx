import { useContext } from "react";
import { Context } from "./Context";
import ToggleLightModeIcon from '/icons/toggle-light-mode.svg';
import ToggleDarkModeIcon from '/icons/toggle-dark-mode.svg';
import { Icon } from "./components/Icon";

export default function ThemeToggle() {
	const ctx = useContext(Context);
	const toggle = () => ctx!.setTheme((t) => (t === "light" ? "dark" : "light"));

	return (
		<button
			onClick={toggle}
			style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
			<Icon
				svg={ctx!.theme === "light" ? ToggleDarkModeIcon : ToggleLightModeIcon}
				data={""}
			/>
		</button>
	);
}
