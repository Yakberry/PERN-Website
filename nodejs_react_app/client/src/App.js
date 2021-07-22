import React, {useEffect, useState} from "react";
import './App.css';
import RegistrationPopup from "./components/registrationPopup/registrationPopup";
import medicine from './medicine.png';

function App() {
  const [response, setResponse] = useState(null);
  const [sops, setSops] = useState(false);
  const [versions, setVersions] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [showPopupLog, setShowPopupLog] = useState(false);
  const [showPopupUpload, setShowPopupUpload] = useState(false);
  const [currentUserToken, setCurrentUserToken] = useState(false);
  const [currentUserLogin, setCurrentUserLogin] = useState(false);
  const [currentSopId, setCurrentSopId] = useState(false);
  const [search, setSearch] = useState('');
  const [showPopupUpload3, setShowPopupUpload3] = useState(false);
  const [currentVersionId, setCurrentVersionId] = useState(false);

  useEffect(() => {
    setCurrentUserToken(sessionStorage.getItem('token'))
    handler_login({token: sessionStorage.getItem('token')})
    handler_sops()
    handler_versions()
  }, []);

  
  const exit = () => {
    sessionStorage.clear()
    setCurrentUserLogin(false)
    setCurrentUserToken(false)
  }

  const handler_docx = () => {
    fetch('/tohtml', {
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify({sopId: currentSopId})
    })
    .then((response) => {
      console.log(response);
      return response.json()
    })
    .then((result) => {
      console.log(result)
      setResponse(result);
    })
    .catch((error) => {
      console.error(error);
    })
  }

  const handler_docx_vers = () => {
    fetch('/tohtml-version', {
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify({versId: currentVersionId})
    })
    .then((response) => {
      console.log(response);
      return response.json()
    })
    .then((result) => {
      console.log(result)
      setResponse(result);
    })
    .catch((error) => {
      console.error(error);
    })
  }

  const handler_sops = (data) => {
    fetch('/sops', {
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify(data)
    })
      .then((response) => {
        console.log(response);
        return response.json()
      })
      .then((result) => {
        console.log(result)
        setSops(result);
      })
      .catch((error) => {
        console.error(error);
      })
  }

  const handler_versions = (data) => {
    fetch('/versions', {
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify(data)
    })
      .then((response) => {
        console.log(response);
        return response.json()
      })
      .then((result) => {
        console.log(result)
        setVersions(result);
      })
      .catch((error) => {
        console.error(error);
      })
  }

  const handler_registration = (data) => {
    console.log(data, "---handler reg entered")
    fetch('/registration', {
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify(data)
    })
    .then((response) => {
      console.log(response);
      if (response.status === 401) {alert('Registration failed: Incorrect login or password')}
      if (response.status === 400) {alert('Refistration failed: Login occupied')}
      return response.json()
    })
    .then((result) => {
      console.log(result)
      sessionStorage.setItem('token', result.token)
      setCurrentUserToken(result.token)
      setCurrentUserLogin(result.login)
      setShowPopup(false)
    })
    .catch((error) => {
      console.error(error);
    })
  }

  const handler_login = (data) => {
    console.log(data, "---handler login entered")
    fetch('/login', {
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify(data)
    })
    .then((response) => {
      console.log(response);
      if (response.status === 401) {alert('Login failed: User with that login does not exist')}
      if (response.status === 400) {alert('Login failed: Wrong password')}
      return response.json()
    })
    .then((result) => {
      console.log(result)
      sessionStorage.setItem('token', result.token)
      setCurrentUserToken(result.token)
      setCurrentUserLogin(result.login)
      setShowPopupLog(false)
    })
    .catch((error) => {
      console.error(error);
    })
  }

 

  const handler_upload = (data) => {
    console.log(data, "---handler upload entered")
    fetch('/upload-doc', {
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify(data)
    })
    .then((response) => {
      console.log(response);
      return response.json()
    })
    .then((result) => {
      console.log(result)
      console.log('Show upload = ' + showPopupUpload)
      setShowPopupUpload(false)
      console.log('Show upload after = ' + showPopupUpload)
    })
    .catch((error) => {
      console.error(error);
    })
  }

  const handler_vote = () => {
    fetch('/vote', {
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify({userLogin: currentUserLogin, sopId: currentSopId, versId: currentVersionId})
    })
    .then((response) => {
      console.log(response);
      
      if (response.status === 400) {alert('Vote failure')}
      else window.location.reload()
      return response.json()
    })
    .then((result) => {
      console.log(result)
    })
    .catch((error) => {
      console.error(error);
    })
    
  }

  const UploadPopup2 = () => {

    const [uploadedFile, setUploadedFile] = useState(null);
    const [formTags, setFormTags] = useState(null);
  
    const onFormSubmit = (e) => {
      e.preventDefault();
      const formData = new FormData()
      const user = currentUserLogin.toString()
      formData.append('file2', uploadedFile)
      formData.append('user', `${user}`)
      console.log(user + ' ' + formData.get('user') + '<- user and formdata')
      

  
      fetch('/upload-file', {
        body: formData,
        method: 'POST'
      })
      .then (() => {
        
        window.location.reload()
        fetch('/upload-file-author', {
          headers: {
            'Content-Type': 'application/json'
          },
          method: 'POST',
          body: JSON.stringify({login: currentUserLogin, tags: formTags})
        
        })
      }
      )

      
    }
  
      return (
        <div className="popup-wrapper">
        <form className="popup" method="POST" onSubmit={e => onFormSubmit(e)} encType="multipart/form-data">
          <input className="formField" type="file"  onChange={e => setUploadedFile(e.target.files[0])}/>
          <label className="formField">Tags (not required)</label>
          <input className="formField" type="text" onChange={e => setFormTags(e.target.value)}/>
          <button className="formField" type="submit">Upload</button>
        </form>
        </div>
      )
    }

    const UploadPopup3 = () => {

      const [uploadedFile, setUploadedFile] = useState(null);
      const [formTags, setFormTags] = useState(null);
    
      const onFormSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData()
        const user = currentUserLogin.toString()
        formData.append('file2', uploadedFile)
        formData.append('user', `${user}`)
        console.log(user + ' ' + formData.get('user') + '<- user and formdata')
        
  
    
        fetch('/upload-version', {
          body: formData,
          method: 'POST'
        })
        .then (() => {
          
          window.location.reload()
          fetch('/upload-version-author', {
            headers: {
              'Content-Type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify({login: currentUserLogin, tags: formTags, thissopid: currentSopId})
          
          })
        }
        )
  
        
      }
    
      return (
        <div className="popup-wrapper">
        <form className="popup" method="POST" onSubmit={e => onFormSubmit(e)} encType="multipart/form-data">
          <input className="formField" type="file"  onChange={e => setUploadedFile(e.target.files[0])}/>
          <label className="formField">Annotation</label>
          <input className="formField" type="text" onChange={e => setFormTags(e.target.value)}/>
          <button className="formField" type="submit">Upload Version</button>
        </form>
        </div>
      )
    }

      class SearchForm extends React.Component {
        constructor(props) {
          super(props);
          this.state = {value: ''};
      
          this.handleChange = this.handleChange.bind(this);
          this.handleSubmit = this.handleSubmit.bind(this);
        }
      
        handleChange(event) {
          this.setState({value: event.target.value});
        }
      
        handleSubmit(event) {
          event.preventDefault();
          handler_sops({searchTarget: this.state.value});
        }
      
        render() {
          return (
            <form className="searchform" onSubmit={this.handleSubmit}>
              <label>
                <input type="text" value={this.state.value} onChange={this.handleChange} />
              </label>
              <input className="buttonSearch" type="submit" value="Search" />
            </form>
          );
        }
      }

    const handler_delete = () => {
      fetch('/delete', {
        headers: {
          'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({userLogin: currentUserLogin, sopId: currentSopId})
      })
      .then((response) => {
        console.log(response);
        if (response.status === 400) {alert('Delete failure: insufficient access')}
        else window.location.reload()
        return response.json()
      })
      .then((result) => {
        console.log(result)
      })
      .catch((error) => {
        console.error(error);
      })
    }

    const handler_download = async () => {
      fetch('/download', {
        headers: {
          'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({sopId: currentSopId})
      })
      .then( async (response) => {
        console.log(response)
        const blob = await response.blob()
        console.log(blob)
        const downloadUrl = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = downloadUrl
       // link.download = file.name
        link.download = 'SOP'
        document.body.appendChild(link)
        link.click()
        link.remove()
      })
    }

    


  return (
    
    <div>
      <section class="hat">
      </section>
      {currentUserLogin &&
      <p class="heading"><b>Greetings, {currentUserLogin}!</b></p>
      }
      
      <section class="middle">
      <label class="LabelControl">SOPs</label>
      {!currentUserLogin && 
        <button class="ButtonControl" onClick={() => setShowPopup(true)}>
          Registration
        </button>
      }
      <button class="ButtonControl" onClick={() => setShowPopupLog(true)}>
        Login
      </button>
      {currentUserLogin &&
        <button class="ButtonControl" onClick={() => setShowPopupUpload(true)}>
          Upload
        </button>
      }
      <button class="ButtonControl" onClick={exit}>
        Logout
      </button>

      
      </section>
      <section class="snake"> <img src={medicine} alt="snake" width="250"/></section>

      <section class="Control_Panel" >
      {currentUserLogin && currentSopId && <button  onClick={handler_vote}>Vote</button>}
      {currentUserLogin && currentSopId && <button  onClick={() => setShowPopupUpload3(true)}>Version</button>}
      <button  onClick={handler_download}>Download</button>
      {currentUserLogin && currentSopId && <button  onClick={handler_delete}>Delete</button>}
      </section>
      
      {!response &&
        <div className="Doc_content"></div>
      }

      {response &&
        <div className="Doc_content" dangerouslySetInnerHTML={{__html: response.message1}}></div>
      }

      {response &&
        <table class="styled-table2">
          <thead>
          <tr>
            <th class="table-long">Version</th>
            <th class="table-short">Author</th>
            <th class="table-short">Rating</th>
            
          </tr>
          </thead>
          <tbody>
            
            {
              versions.filter(item => currentUserLogin === item.author && currentSopId === item.sopId).map(item => (
                  <tr>
                  <td onClick={() => {setCurrentVersionId(item.id); handler_docx_vers()}}>{item.number}</td>
                  <td onClick={() => {setCurrentVersionId(item.id); handler_docx_vers()}}>{item.author} (you)</td>
                  <td onClick={() => {setCurrentVersionId(item.id); handler_docx_vers()}}>{item.rating}</td>
                </tr>
              ))
                
            }
            { 
              versions.filter(item => currentUserLogin !== item.author && currentSopId === item.sopId).map(item => (
                <tr>
                  <td onClick={() => {setCurrentVersionId(item.id); handler_docx_vers()}}>{item.number}</td>
                  <td onClick={() => {setCurrentVersionId(item.id); handler_docx_vers()}}>{item.author}</td>
                  <td onClick={() => {setCurrentVersionId(item.id); handler_docx_vers(); setCurrentVersionId(item.id)}}>{item.rating}</td>
                 
                </tr>
              ))
            }
          </tbody>
        </table>
      }

      {sops && 
        <div>
          <SearchForm></SearchForm>
        <table class="styled-table">
          <thead>
          <tr>
            <th class="table-long">Title</th>
            <th class="table-short">Author</th>
            <th class="table-short">Rating</th>
            
          </tr>
          </thead>
          <tbody>
            
            {
              sops.filter(item => currentUserLogin === item.author).map(item => (
                  <tr>
                  <td onClick={() => {setCurrentSopId(item.id); handler_docx()}}>{item.title}</td>
                  <td onClick={() => {setCurrentSopId(item.id); handler_docx()}}>{item.author} (you)</td>
                  <td onClick={() => {setCurrentSopId(item.id); handler_docx()}}>{item.rating}</td>
                </tr>
              ))
                
            }
            { 
              sops.filter(item => currentUserLogin !== item.author).map(item => (
                <tr>
                  <td onClick={() => {setCurrentSopId(item.id); handler_docx()}}>{item.title}</td>
                  <td onClick={() => {setCurrentSopId(item.id); handler_docx()}}>{item.author}</td>
                  <td onClick={() => {setCurrentSopId(item.id); handler_docx(); setCurrentSopId(item.id)}}>{item.rating}</td>
                 
                </tr>
              ))
            }
          </tbody>
        </table>
        </div>
      }
      

      
      
      {showPopup && <RegistrationPopup onSubmit={handler_registration}/>}
      {showPopupLog && <RegistrationPopup onSubmit={handler_login}/>}
      {showPopupUpload && <UploadPopup2 onSubmit={handler_upload}/>}
      {showPopupUpload3 && <UploadPopup3 onSubmit={handler_upload}/>}
      {currentSopId  &&
      <div className="Doc_content2">
        {
          sops.filter(item => currentSopId === item.id).map(item =>
            //<textarea readOnly="true" rows="5">
            <div>
              {item.tags}
            </div>
            //</textarea>

          )
        }
      </div>
      /*|| currentVersionId && 
      <div className="Doc_content2">
        {
          versions.filter(item => currentVersionId === item.id).map(item =>
            //<textarea readOnly="true" rows="5">
            <div>
              {item.annotation}
            </div>
            //</textarea>

          )
        }
      </div>*/
      } 


      {currentVersionId &&
        <div className="Doc_content2">
        {
          versions.filter(item => currentVersionId === item.id).map(item =>
            //<textarea readOnly="true" rows="5">
            <div>
              {item.annotation}
            </div>
            //</textarea>

          )
        }
        </div>
      }
      
     

    </div>
  );
}

export default App;
