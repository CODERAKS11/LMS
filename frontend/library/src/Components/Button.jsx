import { useState } from "react"

const Button = ({label,onClick})=>{
    const [about, setAbout]=useState(false)

    // const About = ()=>{
    //   setAbout(about)
    // }
    return (<div className="button">

        
    
    <button className="button"onClick={onClick}>
        {label}
    </button>
    
    </div>)
}
export default Button