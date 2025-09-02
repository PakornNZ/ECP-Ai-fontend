// import { X } from "lucide-react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import "@/app/styles/style-AllowUser.css"

export default function AllowUser() {
    const router = useRouter()
    const onActiveAllow = () => {
        localStorage.setItem('allow-user', 'true')
        router.push('/c')
    }

    const handleLogout = async () => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('allow-user', 'false')
            localStorage.setItem('sidebar', 'false')
        }
        await signOut({redirect: true})
    }

    return (
        <>
            <div className="allow-user-container">
                <div className="allow-user-section">
                    <div className="allow-user-bg">
                        {/* <button className="allow-user-close" onClick={cancelActiveAllow}><X /></button> */}
                        <h1>การใช้งาน ECP Ai</h1>
                        <h3>เพื่อพัฒนาและปรับปรุงคุณภาพแชทบอท</h3>
                        <h3>ระบบจะทำการบันทึกข้อมูลการสนทนาระหว่างคุณกับแชทบอท</h3>
                        <h3>รวมถึงข้อมูลส่วนตัวที่ใช้ในการลงทะเบียน</h3>
                        <h3>ผู้ดูแลระบบจะเข้าถึงข้อมูลเหล่านี้เพื่อวัตถุประสงค์ดังกล่าวเท่านั้น</h3>
                        <p>หากคุณยินยอม กรุณากด <span>ยอมรับ</span> เพื่อเข้าใช้งาน</p> 
                        <div className="allow-user-button-container">
                            <button className="refuse-user-button" onClick={handleLogout}>ปฏิเสธ</button>
                            <button className="allow-user-button" onClick={onActiveAllow}>ยอมรับ</button>
                        </div>
                    </div>
                </div>
                <div className="allow-user-fade" />
            </div>
        </>
    )
}