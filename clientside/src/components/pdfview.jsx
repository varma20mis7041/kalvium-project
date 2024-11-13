import { useEffect, useState } from "react";
import axios from "axios";
import PdfComp from "../Pdf";
import { pdfjs } from 'react-pdf';
import NavBar from "./navbar";
import { FaFilePdf } from "react-icons/fa6";
import io from 'socket.io-client';
import GetStarted from "./getstarted";
import { useNavigate } from "react-router-dom";
import { FaUser } from "react-icons/fa";

const socket = io.connect("http://localhost:9000");

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

const PdfView = ()=> {
  const [avlFiles, setavlFiles] = useState([]);
  const [pdfFile, setPdfFile] = useState(null);
  const [adminFiles,setAdminFiles] = useState([]);

  const role = localStorage.getItem("role");
  const navigate = useNavigate();

  const userDetails = JSON.parse(localStorage.getItem("userDetails"));
  console.log("user details in pdf",userDetails)

  useEffect(() => {
    if (role === undefined) {
      navigate('/get-started');
    }
  }, [role, navigate]);



  useEffect(() => {
    if(role === "admin"){
      getPdf();
    }else{
      fetchAdmins();
    }
  }, []);

  const [currindex,updateCurrentIndex] = useState(null);

  const getPdf = async () => {
    try {
      // const result = await axios.get("http://localhost:9000/get-files");
      const response =await axios.get(`http://localhost:9000/api/admin/${userDetails.userName}`);
      console.log(response)
    // console.log(response.data.admin)
    // console.log(response.data.admin.pdfs)
      setavlFiles(response.data.admin.pdfs);
      console.log(avlFiles)
    } catch (error) {
      console.error("Error fetching PDFs:", error);
    }
  };



  const fetchAdmins = async () => {
    try {
      const response = await axios.get('http://localhost:9000/api/user/admins');
      console.log('Admins:', response.data);
      setAdminFiles(response.data.admins)
    } catch (error) {
      console.error('Fetch Admins Error:', error.response ? error.response.data : error.message);
    }
  };
  
  
  const [currentAdminList,updateCurrentAdminList] = useState([]);

  useEffect(() => {
    socket.on("currentindex", (ind) => {
      console.log("Received index from server:", ind);
      updateCurrentIndex(ind.index);
      showPdfI(ind.index);
    });
  
    socket.on("currentAdmin", (adminId) => {
      console.log("current admin",adminId)
      updateCurrentAdminList([...currentAdminList,adminId])
      console.log("current admin array",currentAdminList)
      
    });
  
    return () => {
      socket.off("currentindex");
      socket.off("currentAdmin");
    };
  }, []);
  



  const showPdfI = (id) => {
    console.log(id)
    if (avlFiles[id]) {
      console.log("avlfiles",avlFiles)
      const pdf = avlFiles[id].fileName;
      setPdfFile(`http://localhost:9000/files/${pdf}`);
      console.log(pdf);
    }else{
      console.log("else")
    }
  };
  

  const showPdf = (pdf, index) => {
    updateCurrentIndex(index);
    socket.emit("index", { index });
    socket.emit("page", { message: 1 });
    const presentationDetails = {index,page:1,adminId:userDetails.userName}
    socket.emit("admin",presentationDetails);
    const pdf_name = avlFiles[index].fileName;
    setPdfFile(`http://localhost:9000/files/${pdf_name}`);
  };

  
console.log("crrind",currindex)

const [currentAdminFiles,updateCurrentAdminFiles]  = useState([]);
const [isDisplayAdminFiles, setIsDisplayAdminFiles] = useState(false);

const onClickView = (index) => {
  const selectedAdminFiles = adminFiles[index].pdfs;
  updateCurrentAdminFiles(selectedAdminFiles)
  setIsDisplayAdminFiles(true);
}


  return (
    <div className="">
      <NavBar getPdf={getPdf} />
      <div className="min-h-[130vh] flex justify-end bg-slate-300">
  <div className="w-[80vw] flex justify-center">
    {pdfFile !== null ? (
      <PdfComp pdfFile={pdfFile} />
    ) : (
      <div className="flex flex-col justify-center">
        {role === "admin" ? "Choose a file to start presentation!" : "No presentation going on!"}
      </div>
    )}
  </div>

  <div className="w-[20vw] h-[130vh] bg-black">
    {role === "admin" ? (
      // Admin view
      avlFiles.length === 0 ? (
        <div className="h-full flex flex-col justify-center items-center">
          <h1 className="text-white">No PDFs found</h1>
        </div>
      ) : (
        <>
          <h1 className="text-white text-center w-full text-3xl mt-5">Added Files</h1>
          <div className="flex flex-wrap p-5 mt-10">
            {avlFiles.map((eachpdf, index) => (
              <div
                key={index}
                className={`h-[100px] w-[150px] border border-black text-black mr-3 mb-3 flex flex-col justify-center items-center rounded-md 
                ${currindex === index ? " text-white bg-gray-800 border-white" : "bg-white"}`}
              >
                <div>
                  <FaFilePdf />
                </div>
                <h1>Name : {eachpdf.title}</h1>
                <button
                  onClick={() => showPdf(eachpdf.pdf, index)}
                  className="px-5 bg-blue-500 text-white rounded"
                >
                  Present
                </button>
              </div>
            ))}
          </div>
        </>
      )
    ) : (
      // Non-admin view
      adminFiles.length === 0 ? (
        <div className="h-full flex flex-col justify-center items-center">
          <h1 className="text-white">No Admins Found</h1>
        </div>
      ) : (
        <>
          {isDisplayAdminFiles ? (
  currentAdminFiles.length === 0 ? (
    <div className="h-full flex flex-col justify-center items-center">
      <h1 className="text-white">No Files Found</h1>
    </div>
  ) : (
    <>
    <h1 className="text-white text-center w-full text-3xl mt-5">Admin Files</h1>
    {currentAdminFiles.map((eachFile, index) => (
      <div
        key={index}
        className={`h-[100px] w-[150px] border border-black text-black mr-3 mb-3 flex flex-col justify-center items-center rounded-md 
        ${currindex === index ? " text-white bg-gray-800 border-white" : "bg-white"}`}
      >
        <div>
          <FaFilePdf />
        </div>
        <h1>Name : {eachFile.title}</h1>
        {/* <button
          className="px-5 bg-blue-500 text-white rounded"
          onClick={() => onClickView(index)}
        >
          View
        </button> */}
      </div>
    ))}
    </>
  )
) : (
  <>
    <h1 className="text-white text-center w-full text-3xl mt-5">Admins</h1>
    <div className="flex flex-wrap p-5 mt-10">
      {adminFiles.map((eachAdmin, index) => (
        <div
          key={index}
          className={`h-[100px] w-[150px] border border-black text-black mr-3 mb-3 flex flex-col justify-center items-center rounded-md 
          ${currindex === index ? " text-white bg-gray-800 border-white" : "bg-white"}`}
        >
          <div>
            <FaUser />
          </div>
          <h1>Name : {eachAdmin.name}</h1>
          <button
            className="px-5 bg-blue-500 text-white rounded"
            onClick={() => onClickView(index)}
          >
            View
          </button>
        </div>
      ))}
    </div>
  </>
)}

        </>
      )
    )}
  </div>
</div>

    </div>
  );
}

export default PdfView;
