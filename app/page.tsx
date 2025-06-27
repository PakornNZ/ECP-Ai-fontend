"use client"

import "@/app/styles/style-Homepage.css";
import Sidebar from "@/app/components/Sidebar";
import SettingUser from "@/app/components/popup/Setting-User-Popup";
import { PanelLeft, Send, SquarePlus, Squircle } from 'lucide-react';
import { useEffect, useState, useRef, useCallback } from "react";
import { useOnClickOutside } from "@/app/components/useOnClickOutside";
import { useRouter, usePathname } from "next/navigation";
import { useLocalStorage } from "./hooks/useLocalStorage";
import Chat from "@/app/components/chats/Chat";
import { encrypt, decrypt, encryptURL } from "@/utils/crypto"
import { useSession } from "next-auth/react";
import { Arlert, LogoutState, ProfileUser } from "@/app/components/object/object"
import axios from "axios";
import Loading from "./components/dashboard/LoadingFull";
import Image from "next/image";

interface MessageProps {
  id: number | null
  query: string
  answer: string | null
  rating: number
}

interface ChatHistoryProps {
  id: number
  chat_history: string
  date: Date
}


export default function Homepage() {
  const { data: session } = useSession()
  const router = useRouter()
  // ! ข้อมูลผู้ใช้งาน
  const [chatId, setChatId] = useState<number | null>(null)
  const [message, setMessage] = useState<MessageProps[] | null>(null)

  // ! ข้อมูลผู้มาเยือน
  const [guest, setGuest] = useState<boolean | null>(null)

  // ^ เงื่อนไขสำหรับการทำงาน
  const [isUserLoading, setIsUserLoading] = useState<boolean>(false)
  const [startNewChat, setStartNewChat] = useState<boolean>(false)
  const shouldMessage = session && !chatId
  const shouldMessageGuest = !session && !guest

  const [loading, setLoading] = useState<boolean>(true)
  useEffect(() => {
    if (typeof session === "undefined") return
    const timeOut = setTimeout(() => {
      setLoading(false)
    }, 200)
    return () => clearTimeout(timeOut)
  }, [session])

  const get_chatRoom =  useCallback(async (chat_id: number) => {
    try {
      const res = await axios.post('/api/data/new_chat/recheck', { chat_id })
      const resData = res.data

      if (resData.status === 1) {
        setStartNewChat(true)
        setTimeout(() => setIsUserLoading(true), 200)
        setTimeout(() => {
          setChatId(resData.data.chat_id)
          setMessage(resData.data.chat)
        }, 200)
      } else {
        setChatId(resData.data.chat_id)
        setArlertMessage({
          color: true,
          message: resData.message
        })
        const timeOutAPI = setTimeout(() => {
            setArlertMessage({
                color: true,
                message: ""
            })
        }, 6000)
        return () => clearTimeout(timeOutAPI)
      }
    } catch {
      router.push('/')
    }
  }, [router])

  // * รับid จากsildbar
  const handleChatId = (chat_id: number) => {
    setMessage(null)
    get_chatRoom(chat_id)
  }

  // * ตรวจสอบการเข้าถึงแชทผ่านลิ้ง
  const pathname = usePathname()
  useEffect(() => {
    const decodeURL = async (url: string) => {
      const encodeChatId = decodeURIComponent(url)
      const chat_id = await decrypt(encodeChatId)
      if (!chat_id) return router.push('/')
      get_chatRoom(Number(chat_id))
    }

    const match = pathname.match(/\/chats\/(.+)$/)
    if (match && !chatId) {
      setLoading(true)
      setStartNewChat(true)
      decodeURL(match[1])
      setLoading(false)
    } else if (pathname == "/") {
      setTimeout(() => setIsUserLoading(true), 200)
      setChatId(null)
      setQuery("")
      setSendButton(false)
      setMessage(null)
      setIsLoading(false)
      setGuest(null)
      setStartNewChat(false)
    }
  }, [pathname, chatId, get_chatRoom, router])

              // ! section setting
              const [activeSetting, setActiveSetting] = useState<boolean>(false)
              const [sidebar, setSidebar] = useLocalStorage('sidebar', false)
              const [scale, setScale] = useState<boolean>(false)

              // *เปิด-ปิด POPUP ตั้งค่าผู้ใช้งาน
              const handleSettingUser = (state: boolean) => {
                setTimeout(() => {
                  setActiveSetting(state)
                }, 100)
              }

              const popupRef = useRef<HTMLDivElement | null>(null)
              const buttonRef = useRef<HTMLButtonElement | null>(null)
              useOnClickOutside(popupRef, (event) => {
                  if (buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
                    setActiveSetting(false)
                  }
              })

              // * เปิด-ปิด SIDEBAR
              const handleOpenSidebar = () => {
                setSidebar(true)
              }

              const handleCloseSidebar = () => {
                setSidebar(false)
              }

              useEffect(() => {
                const CheckResize = () => {
                  setScale(window.innerWidth <= 1024)
                }
                CheckResize()
                
                window.addEventListener('resize', CheckResize)

                return () => {
                  window.removeEventListener('resize', CheckResize)
                }
              }, [])

              // *router ไปยังหน้าอื่นๆๆๆ
              const handleLogin = () => {
                router.push("/user/login-ecp_ai")
              }

              const hadleHome = () => {
                router.push("/")
              }


              // ! section chat
              // * คำถาม
              const textAreaRef = useRef<HTMLTextAreaElement>(null)

              const [sendButton, setSendButton] = useState<boolean>(false)
              const [query, setQuery] = useState<string>("")

              const hadleQuery = (event : React.ChangeEvent<HTMLTextAreaElement>) => {
                const value = event.target.value
                setQuery(value)

                if (textAreaRef.current) {
                  textAreaRef.current.style.height = "auto"
                  textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`
                }
              
                setSendButton(value.trim().length > 0)
              }


              // * เมื่อกดปุ่มsubmit ส่งคำถาม
              const handleSubmitSend = async () => {
                const controller = new AbortController()
                const querySend = query.trim()
                setQuery("")
                controllerRef.current = controller
                if (textAreaRef.current) textAreaRef.current.style.height = "auto"

                if (session) {
                  if (!chatId) {
                    setStartNewChat(true)
                    const chat_id = await submitQueryNewChat()
                    const newMessage: MessageProps = {
                      id: null,
                      query: querySend,
                      answer: null,
                      rating: 0
                    }
                    setMessage( prev => prev ? [...prev, newMessage] : [newMessage])
                    setIsLoading(true)

                    responseAnsewer(chat_id, querySend)
                    CreateTopicChat(chat_id, querySend)
                  } else {
                    const newMessage: MessageProps = {
                      id: null,
                      query: querySend,
                      answer: null,
                      rating: 0
                    }
                    setMessage( prev => prev ? [...prev, newMessage] : [newMessage])
                    setIsLoading(true)
                    responseAnsewer(chatId, querySend)
                  }
                } else {
                  submitQueryGuest(querySend)
                }
              }


                    // * ข้อความแจ้งเตือน
                    const [arlertMessage, setArlertMessage] = useState({
                      color: true,
                      message: ""
                    })


                                    // * สร้างห้องแชทใหม่ ในครั้งแรก
                                    const submitQueryNewChat = async () => {
                                      try {
                                        const res = await axios.post('/api/data/new_chat')
                                        const resData = res.data

                                        if (resData.status === 1) {
                                          setChatId(resData.data.chat_id)
                                          const encodeChatId = encodeURIComponent(await encrypt(resData.data.chat_id))
                                          window.history.pushState({}, '', `/chats/${encodeChatId}`)
                                          return resData.data.chat_id
                                        }
                                      } catch (error: unknown) {
                                        if (!axios.isAxiosError(error)) return
                                        const errorMessage = error.response?.data?.message
                                        setArlertMessage({
                                            color: false,
                                            message: errorMessage
                                        })
                                        const timeOutAPI = setTimeout(() => {
                                            setArlertMessage({
                                                color: false,
                                                message: ""
                                            })
                                        }, 6000)
                                        return () => clearTimeout(timeOutAPI)
                                      }
                                    }


                                    // * ตั้งชื่อแชท
                                    const [topic, setTopic] = useState<ChatHistoryProps | null>(null)
                                    const CreateTopicChat = async (chat_id: number, querySend: string) => {
                                      const payload = {
                                        "chat_id": chat_id,
                                        "query": querySend
                                      }

                                      try {
                                        const res = await axios.put('/api/chat/new_topic', payload )
                                        const resData = res.data

                                        if (resData.status === 1) {
                                          setTopic(resData.data)
                                        }
                                      } catch (error: unknown) {
                                        if (!axios.isAxiosError(error)) return
                                        const errorMessage = error.response?.data?.message
                                        setArlertMessage({
                                            color: false,
                                            message: errorMessage
                                        })
                                        const timeOutAPI = setTimeout(() => {
                                            setArlertMessage({
                                                color: false,
                                                message: ""
                                            })
                                        }, 6000)
                                        return () => clearTimeout(timeOutAPI)
                                      }
                                    }



              // * สร้างห้องแชทสำหรับผู้ที่ไม่มีบัญชี
              const submitQueryGuest = async (querySend: string) => {
                if (session) return

                if (!message) {
                  setGuest(true)
                  const encodeURL = encodeURIComponent(await encryptURL('guest'))
                  window.history.pushState({}, '', `/guest/${encodeURL}`)
                  setStartNewChat(true)
                  responseAnsewerGuest(querySend)
                } else {
                  responseAnsewerGuest(querySend)
                }
              }
              
              const responseAnsewerGuest = async (querySend: string) => {
                
                const newMessage: MessageProps = {
                  id: null,
                  query: querySend,
                  answer: null,
                  rating: 0
                }
                setMessage( prev => prev ? [...prev, newMessage] : [newMessage])
                setIsLoading(true)
  
                try {
                  const res = await axios.post('/api/chat/guest_response', { querySend } )
                  const resData = res.data
                  if (resData.status === 1) {
                    setMessage( prev => {
                      if (!prev) return null
  
                      const update = [...prev]
                      const lastIndex = update.length - 1
  
                      update[lastIndex] = {
                        ...update[lastIndex],
                        id: null,
                        answer: resData.data.answer
                      }
  
                      return update
                    })
                  }
                } catch (error: unknown) {
                  if (!axios.isAxiosError(error)) return
                  const errorMessage = error.response?.data?.message
                  setArlertMessage({
                      color: false,
                      message: errorMessage
                  })
                  const timeOutAPI = setTimeout(() => {
                      setArlertMessage({
                          color: false,
                          message: ""
                      })
                  }, 6000)
                  return () => clearTimeout(timeOutAPI)
                } finally {
                  setIsLoading(false)
                  setSendButton(false)
                }
              }
              


                        // ! API Chat
                        // * Loading
                        const [isLoading, setIsLoading] = useState<boolean>(false)

                        // * หยุดการทำงานของการตอบกลับ
                        const controllerRef = useRef<AbortController | null>(null)
                        const handleStopResponse = () => {
                          if (controllerRef.current) {
                            controllerRef.current.abort()
                            controllerRef.current = null
                          }
                          setIsLoading(false)
                        }


                                // * ตอบกลับคำถาม
                                const responseAnsewer = async (chat_id: number, querySend: string) => {
                                  const payload = {
                                    "chat_id": chat_id,
                                    "query": querySend
                                  }
                                  try {
                                    const res = await axios.post('/api/chat/response', payload )
                                    const resData = res.data
                                    if (resData.status === 1) {
                                      setMessage( prev => {
                                        if (!prev) return null

                                        const update = [...prev]
                                        const lastIndex = update.length - 1

                                        update[lastIndex] = {
                                          ...update[lastIndex],
                                          id: resData.data.id,
                                          answer: resData.data.answer
                                        }

                                        return update
                                      })
                                    }
                                  } catch (error: unknown) {
                                    if (!axios.isAxiosError(error)) return
                                    const errorMessage = error.response?.data?.message
                                    setArlertMessage({
                                        color: false,
                                        message: errorMessage
                                    })
                                    const timeOutAPI = setTimeout(() => {
                                        setArlertMessage({
                                            color: false,
                                            message: ""
                                        })
                                    }, 6000)
                                    return () => clearTimeout(timeOutAPI)
                                  } finally {
                                    setIsLoading(false)
                                    setSendButton(false)
                                  }
                                }



              // * แก้ไขคำถาม
              const handleUpdateQuery = (id: number, newQuery: string) => {
                setIsLoading(true)
                if (!message) return

                setMessage((prev) => {
                  if (!prev) return prev
                  return prev.map((item) => 
                    item.id === id ? { ...item, query: newQuery } : item
                  )
                })

              }
              
              const handleUpdateAnswer = (id: number, newAnswer: string) => {
                if (!message) return
                
                setMessage((prev) => {
                  if (!prev) return prev
                  return prev.map((item) => 
                    item.id === id ? { ...item, answer: newAnswer } : item
                  )
                })
                setIsLoading(false)
              }              



              // * กล่องข้อความ เมื่อ ENTER
              const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  if (sendButton && !isLoading) {
                    e.preventDefault()
                    handleSubmitSend()
                  }
                }
              }


              // * logout 
              const [isLogoutState, setIsLogoutState] = useState<boolean>(false)
              const handleLogout = (isLogout: boolean) => {
                setIsLogoutState(isLogout)
              }

              const [isProfileState, setIsProfileState] = useState<boolean>(false)
              const handleProfileUser = (isProfile: boolean) => {
                setIsProfileState(isProfile)
              }


  if (loading) {
      return (
          <div style={{ width: '100vw', height: '100vh' }}>
              <Arlert messageArlert={arlertMessage} />
              <Loading />
          </div>
      )
  }
  return (
    <>
        <ProfileUser isProfile={isProfileState} setIsProfile={handleProfileUser}/>
        <Arlert messageArlert={arlertMessage} />
        <div className="homepage">
          <div className="silebar">
            <Sidebar 
              isState={sidebar} 
              closeSidebar={handleCloseSidebar}
              ChatIdSelect={handleChatId}
              chatId={chatId}
              newTopic={topic}/>
          </div>
          { sidebar && scale && <div className="sidebar-fade" onClick={handleCloseSidebar}></div> }
          <div className="mainpage">
            <header>
              { isUserLoading ? (
                <div className="mainpage-1">
                  { !session ? (
                    <button left-title="สร้างการสนทนา" type="button" onClick={hadleHome}>
                      <SquarePlus />
                    </button>
                  ) : (
                    !sidebar && <button left-title="เปิด Sidebar" type="button" onClick={handleOpenSidebar}>
                    <PanelLeft />
                    </button>
                  )}
                </div>
              ) : (
                <div className="mainpage-1 skeleton" style={{ width: "29px", height: "29px", borderRadius: "8px"}}></div>
              )}
              <h1 className={`${sidebar ? "ecp-magin" : ""}`} onClick={hadleHome}>ECP Ai</h1>
              { isUserLoading ? (
                <div className="mainpage-2">
                { !session ? (
                  <div className="user-login" right-title="เข้าสู่ระบบ" onClick={handleLogin}>
                    <button type="button">ลงชื่อเข้าใช้</button>
                  </div>
                ) : (
                  <>
                    <div className="user-setting" right-title="ตั้งค่าบัญชี">
                      <button ref={buttonRef} type="button" onClick={() => handleSettingUser(!activeSetting)}>
                        { session?.user.image &&<Image src={session?.user.image} width={30} height={30} alt="pic-profile" />}
                      </button>
                    </div>
                    { activeSetting && <SettingUser popupRef={popupRef} setIsLogout={handleLogout} setIsProfile={handleProfileUser} setActiveSetting={handleSettingUser} /> }
                    <LogoutState isLogout={isLogoutState} setIsLogout={handleLogout}/>
                  </>
                )}
              </div>
              ) : (
                <div className="mainpage-2 skeleton" style={{ width: "29px", height: "29px", borderRadius: "8px"}}></div>
              )}
            </header>
            <section>
              {/* การตอบกลับของ chatbot */}
              <Chat MoveSection={startNewChat}
                    message={message} 
                    isLoading={isLoading} 
                    onUpdateQuery={handleUpdateQuery} 
                    onUpdateAnswer={handleUpdateAnswer} />
              
              <div className="chat">
                { isUserLoading ? (
                    <>
                      { shouldMessage && ( 
                      <div className="chat-welcome">
                        <h1>สวัสดีคุณ {session?.user.name.split(" ")[0]}</h1>
                        <h2>วันนี้ต้องการให้ฉันช่วยเรื่องอะไร</h2>
                      </div> 
                      )}
                      { shouldMessageGuest && ( 
                        <div className="chat-welcome">
                          <h1>สวัสดี ยินดีต้อนรับ</h1>
                          <h2>วันนี้ต้องการให้ฉันช่วยเรื่องอะไร</h2>
                        </div> 
                      )}
                    </>
                  ) : (
                    <div className="chat-welcome">
                      <p className="skeleton skeleton-text" style={{ width: "300px", height: "42px"}}/>
                      <p className="skeleton skeleton-text" style={{ width: "250px", height: "34px", marginBottom: "20px"}}/>
                    </div>
                )}
                
                <div className="chat-box">
                  <div className={`chat-box-bg ${ isLoading ? "loading" : ""}`}>
                    {/* ข้อความสำหรับผู้ใช้งาน ถามคำถาม */}
                    <textarea
                        ref={textAreaRef}
                        rows={1}
                        placeholder="คุณต้องการถามอะไร?" 
                        value={query} 
                        onChange={hadleQuery}
                        onKeyDown={handleKeyDown}/>
                    <button disabled={!sendButton && !isLoading} type="button"
                      onClick={() => {
                        if (isLoading) {
                          handleStopResponse()
                        } else {
                          handleSubmitSend()
                        }
                      }}>
                        {isLoading ? <Squircle /> : <Send />}
                    </button>
                  </div>
                </div>
              </div>
            </section>
            <footer>การให้คะแนน จะใช้ในการประเมินความถูกต้องและแม่นยำของคำตอบ</footer>
          </div>
        </div>
    </>
  )
}