import "@/app/styles/style-EditHistory.css";
import { Pencil, Trash2 } from 'lucide-react';
import { useRef } from "react";
import { useOnClickOutside } from "@/app/components/useOnClickOutside";

interface EditHistoryProps {
    msg_id: number
    message: string
    onClose: () => void
    updateTopic: (msg_id: number, message: string) => void
    setIsDelete: (msg_id: number) => void
}

export default function EditHistory({ msg_id, message, onClose, updateTopic, setIsDelete } : EditHistoryProps) {
    const popupRef = useRef<HTMLDivElement>(null)

    useOnClickOutside(popupRef, () => {
        onClose()
    })

    return (
        <>
            <div className="edit-popup">
                <div className="edit-menu" ref={popupRef}>
                    <ul>
                        <li 
                            style={{ display: "flex", justifyContent: "center", marginBottom: "5px"}}
                            onClick={(event) => {
                                event.stopPropagation()
                                onClose()
                            }}>
                                ยกเลิก
                        </li>
                        <li onClick={(event) => {
                            event.stopPropagation()
                            onClose()
                            updateTopic(msg_id, message)}}>
                                <Pencil />เปลี่ยนชื่อ
                        </li>
                        <li className="delete-pop" onClick={(event) => {
                            event.stopPropagation()
                            onClose()
                            setIsDelete(msg_id)}}>
                                <Trash2 />ลบ
                        </li>
                    </ul>
                </div>
            </div>
        </>
    )
}