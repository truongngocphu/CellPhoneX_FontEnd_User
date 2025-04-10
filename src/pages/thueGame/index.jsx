import { useEffect, useState } from "react"
import { getOneThueGame } from "../../services/thueGameLienHeAPI"

const ThueGame = () => {

    const [dataThueGame, setDataThueGame] = useState(null)
    const fetchOneThueGames = async () => {
        const res = await getOneThueGame()
        if(res && res.data) {
            setDataThueGame(res.data)
        }
    }
    useEffect(() => {
        fetchOneThueGames()
    }, [])
  return (
    <div>
        <div className="rts-navigation-area-breadcrumb bg_light-1">
            <div className="container">
                <div className="row">
                <div className="col-lg-12">
                    <div className="navigator-breadcrumb-wrapper">
                    <a href='/'>Home</a>
                    <i className="fa-regular fa-chevron-right" />
                    <a className="#">Thuê game</a>
                    
                    </div>
                </div>
                </div>
            </div>
        </div>

        <div className="rts-faq-area-start ">
            <div className="container">
                <div className="row g-6">
                    <div className="bg_gradient-tranding-items p-5">
                    <div  dangerouslySetInnerHTML={{ __html: dataThueGame?.text }} />
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}
export default ThueGame