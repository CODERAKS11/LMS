import book9 from '../assets/book9.jpg'
import book2 from '../assets/book2.jpg'
import book10 from '../assets/book10.jpg'
import book4 from '../assets/book4.jpeg'
import book11 from '../assets/book11.webp'
import book6 from '../assets/book6.jpg'
import book7 from '../assets/book7.jpg'
import book8 from '../assets/book8.jpeg'
import BorrowButton from '../Components/BorrowButton'
import cusat from '../assets/download.jpeg'
import SearchCatalog from '../Components/SearchCatalog'

const Section = ()=>{
    return(<div> 
    <section className="section"/>
    <img src={cusat} alt='cusat' className='cusat'></img>
    <SearchCatalog/>
    <h1>Newly Stocked </h1>
    <div className="section2">
        <div className='book1'>
         <button className='imagebutton'> <img src={book9}alt='book1' ></img></button>
         <button className='imagebutton'> <img src={book2}alt='book1' ></img></button>
         <button className='imagebutton'> <img src={book10}alt='book1' ></img></button>
         <button className='imagebutton'> <img src={book4}alt='book1' ></img></button>
         <button className='imagebutton'> <img src={book11}alt='book1' ></img></button>
         <button className='imagebutton'> <img src={book6}alt='book1' ></img></button>
        
        </div>
        

    </div >
    <div className='section3'>
     <BorrowButton/>
     <BorrowButton/>
     <BorrowButton/>
     <BorrowButton/>
     <BorrowButton/>
     <BorrowButton/>
     
    </div>

   
    </div>)
}
export default Section