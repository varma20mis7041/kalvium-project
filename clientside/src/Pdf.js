import { useEffect, useState } from 'react';
import { Document, Page } from 'react-pdf';


import { GrFormNext, GrFormPrevious } from "react-icons/gr";
import { MdOutlineNavigateNext } from "react-icons/md";
import io from 'socket.io-client'

const socket = io.connect("http://localhost:9000")


function PdfComp(props) {
  const [numPages, setNumPages] = useState();
  const [pageNumber, setPageNumber] = useState(1);

  function onDocumentLoadSuccess({numPages}) {
    setNumPages(numPages);
  }
const role = localStorage.getItem("role");
  const prev = () => {
    if(pageNumber >1){
      setPageNumber(pageNumber-1)
      socket.emit("page", { message: pageNumber-1 });
    }
  }
  

  const next = () => {
    console.log("Next button clicked");
   
    if (pageNumber < numPages) {

      setPageNumber(pageNumber + 1);
      socket.emit("page", { message: pageNumber+1 });
    }
  };
  

useEffect(()=>{
  socket.on("currentpage",(data)=>{
  console.log("data in client",data)
  setPageNumber(data.message)
  })
},[socket])


  return (
    <div className='w-[30vw] h-[80vh] mt-2 flex flex-col items-center'>
  <Document file={props.pdfFile} onLoadSuccess={onDocumentLoadSuccess}>
    <Page pageNumber={pageNumber} renderTextLayer={false} renderAnnotationLayer={false} />
  </Document>
  <div className='flex flex-row items-center justify-center mt-2 space-x-2'>
    {role === "admin" && (<button onClick={prev}><GrFormPrevious /></button>)}
    <div>{`${pageNumber} / ${numPages}`}</div>
    {role === "admin" && (<button onClick={next}><GrFormNext /></button>)}
  </div>
</div>

  );
}

export default PdfComp