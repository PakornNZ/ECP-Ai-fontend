import "@/app/styles/style-SettingUser.css";
import { Settings, LogOut } from 'lucide-react';

interface SettingUserProps {
    popupRef?: React.RefObject<HTMLDivElement | null>
    setIsLogout: (isLogout: boolean) => void
    setIsProfile: (isProfile: boolean) => void
    setActiveSetting: (activeSetting: boolean) => void
}

export default function SettingUser({ popupRef, setIsLogout, setIsProfile, setActiveSetting } : SettingUserProps) {

    return (
        <>
            <div className="setting-popup">
                <div className="setting-menu" ref={popupRef}>
                    <ul>
                        <li onClick={() => {
                            setIsProfile(true)
                            setActiveSetting(false)}}><Settings />บัญชี</li>
                        <li onClick={() => {
                            setIsLogout(true)
                            setActiveSetting(false)}} className="logout-list"><LogOut/>ลงชื่อออก</li>
                    </ul>
                </div>
            </div>
        </>
    )
}