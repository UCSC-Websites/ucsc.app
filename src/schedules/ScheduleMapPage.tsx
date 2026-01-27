import { useContext } from "react"
import { Context } from "../Context";
import { TopBar as MobileTopBar } from "../components/navbar/mobile/TopBar";
import { TopBar as DesktopTopBar } from "../components/navbar/desktop/TopBar";
import Map from "./Map";


export default function ScheduleMapPage() {
	const ctx = useContext(Context);

	return (
		<>
			{ctx!.mobile ? <MobileTopBar /> : <DesktopTopBar />}
			<Map />
		</>
	)
}