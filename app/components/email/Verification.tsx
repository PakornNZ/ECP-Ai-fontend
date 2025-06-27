/* eslint-disable @next/next/no-img-element */
interface EmailVerificationEmailTemplateProps {
    emailVerificationLink: string
}

export default function EmailVerificationEmailTemplate(
    { emailVerificationLink }: EmailVerificationEmailTemplateProps) {

    return (
        <div
            style={{
                maxWidth: '600px',
                backgroundColor: '#f7f7f7',
                padding: '10px',
                fontFamily: 'Arial, sans-serif',
                color: '#3b3b3b',
                borderRadius: '18px',
                margin: '0 auto',
                width: '100%',
                boxSizing: 'border-box',
                textAlign: 'center'
            }}
        >
            <table cellPadding={0} cellSpacing={0}  border={0}  style={{ width: '100%', margin: '10px auto' }} >
                <tr>
                    <td style={{ textAlign: 'center' }}>
                        <img
                            src="https://i.pinimg.com/736x/a6/84/a3/a684a372af2b177e6a5e1f6589954d26.jpg"
                            alt="Logo"
                            width={40}
                            height={40}
                            style={{ width: '40px', height: '40px', borderRadius: '50%', display: 'inline-block', verticalAlign: 'middle', marginRight: '10px' }}
                        />
                        <span style={{ fontSize: '40px', fontWeight: 'bold', color: '#F87316', display: 'inline-block', verticalAlign: 'middle', wordBreak: 'keep-all' }}>ECP Ai</span>
                    </td>
                </tr>
            </table>

            <p style={{ fontSize: '14px', margin: '0', marginTop: '20px' }}>
                มีคำขอยืนยันตัวตนสำหรับการลงทะเบียนเข้าใช้งานเว็บไซต์ ECP Ai
            </p>
            <p style={{ fontSize: '14px', margin: '0' }}>
                กรุณาคลิกปุ่มด้านล่างเพื่อยืนยันอีเมลของคุณภายใน 5นาที หากเกินเวลากำหนด
            </p>
            <p style={{ fontSize: '14px', margin: '0' }}>
                คุณสามารถส่งคำขอยืนยันตัวตนอีกครั้ง หรือสามารถลงทะเบียนใหม่ได้ภายหลัง
            </p>

            <p style={{ margin: '0', marginTop: '20px', fontSize: '12px', color: '#3b3b3b', opacity: '0.8', textAlign: 'center' }}>
                หากคุณไม่ได้ร้องขอการยืนยันอีเมล กรุณาอย่าดำเนินการใด ๆ
            </p>

            <table cellPadding={0} cellSpacing={0}  border={0} style={{ width: '100%', margin: '20px auto' }} >
                <tr>
                    <td style={{ textAlign: 'center' }}>
                        <a
                            href={emailVerificationLink}
                            style={{
                                display: 'inline-block',
                                backgroundColor: '#F87316',
                                color: 'white',
                                textDecoration: 'none',
                                padding: '10px 20px',
                                borderRadius: '8px',
                                fontSize: '16px', 
                                margin: '0 auto',
                                wordBreak: 'keep-all'
                            }}
                        >
                            ยืนยันอีเมล
                        </a>
                    </td>
                </tr>
            </table>
        </div>
    )
}