const BorrowButton=()=>{
    return(
        <div className="borrowbutton">
            <button className="borrow">Borrow</button>
            <button className="save" onClick={()=>
                {alert("Book saved")}} >Save</button>
        </div>
    )
}
export default BorrowButton