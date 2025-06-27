import { Ripple } from 'react-css-spinners'
import "@/app/styles/Style-Loading.css"

export default function Loading() {
    return (
        <>
            <div 
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    width: "100%",
                    height: "100%",
                }}>
                <Ripple className='loading-full-section'/>
            </div>
        </>
    )
}