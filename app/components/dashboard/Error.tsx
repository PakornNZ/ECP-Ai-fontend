import "@/app/styles/style-Error.css"
import { RotateCw } from "lucide-react"

export function Error() {
    return (
        <>
            <div className="error-container">
                <div className="error-section" onClick={() => window.location.reload()}>
                    <RotateCw size={120}/>
                    <p>เกิดข้อผิดพลาดในการดึงข้อมูล</p>
                    <span>คลิกเพื่อลองใหม่อีกครั้ง</span>
                </div>
            </div>
        </>
    )
}